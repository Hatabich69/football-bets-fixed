async function api(url, method = 'GET', data = null, auth = false) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (data) opts.body = JSON.stringify(data);
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(url, opts);
  return await res.json();
}

function requireAuthOrRedirect() {
  const t = localStorage.getItem('token');
  if (!t) window.location = '/login.html';
}

function logout() {
  localStorage.removeItem('token');
  window.location = '/index.html';
}

// Matches list for index/dashboard
async function loadMatches(targetId = 'matches', withButtons = false) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const matches = await api('/api/matches');
  container.innerHTML = '';
  matches.forEach(m => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div>
        <b>${m.home_team}</b> vs <b>${m.away_team}</b>
        <div class="small">${m.kickoff_at} • ${m.status}</div>
      </div>
      ${withButtons ? `<button data-id="${m.id}">Поставити</button>` : ''}
    `;
    if (withButtons) {
      div.querySelector('button').addEventListener('click', () => showBetForm(m.id));
    }
    container.appendChild(div);
  });
}

async function showBetForm(matchId) {
  const odds = await api(`/api/matches/${matchId}/odds`);
  if (!odds.length) {
    alert('Для цього матчу ще немає коефіцієнтів');
    return;
  }
  const container = document.getElementById('matches');
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <h4>Ставка на матч #${matchId}</h4>
    <form id="betForm">
      <label>Вибір:</label>
      <select name="selection">
        ${odds.map(o => `<option value="${o.selection}">${o.market}: ${o.selection} @ ${o.price}</option>`).join('')}
      </select>
      <label>Сума ставки:</label>
      <input name="stake" type="number" min="1" step="0.01" required />
      <input type="hidden" name="match_id" value="${matchId}">
      <input type="hidden" name="price" value="${odds[0].price}">
      <button>Підтвердити ставку</button>
    </form>
    <div id="betMsg" class="small"></div>
  `;
  container.prepend(div);

  const form = div.querySelector('#betForm');
  form.addEventListener('change', () => {
    const sel = form.selection.value;
    const found = odds.find(o => o.selection === sel);
    form.price.value = found ? found.price : odds[0].price;
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.stake = Number(data.stake);
    data.price = Number(data.price);
    const res = await api('/api/bets', 'POST', data, true);
    div.querySelector('#betMsg').textContent =
      res.error || `Ставку створено. Новий баланс: ${res.balance_after}`;
  });
}

// User dashboard
async function loadProfile() {
  const box = document.getElementById('profile');
  if (!box) return;
  const res = await api('/api/user/me', 'GET', null, true);
  if (res.error) {
    box.textContent = res.error;
    return;
  }
  const { user, stats } = res;
  box.innerHTML = `
    <div class="card">
      <h3>${user.username} <span class="badge">${user.role}</span></h3>
      <div class="small">Email: ${user.email}</div>
      <div class="small">Баланс: <b>${user.balance.toFixed(2)}</b> грн</div>
      <div class="small">Ставок: ${stats.total_bets || 0},
        виграшів: ${stats.wins || 0},
        програшів: ${stats.loses || 0}
      </div>
      <button onclick="logout()">Вийти</button>
    </div>
  `;
}

async function loadMyBets() {
  const container = document.getElementById('bets');
  if (!container) return;
  const res = await api('/api/bets/me', 'GET', null, true);
  if (res.error) {
    container.textContent = res.error;
    return;
  }
  container.innerHTML = '';
  res.forEach(b => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div>
        #${b.id} • ${b.home_team} vs ${b.away_team}
        <div class="small">
          Вибір: ${b.selection}, сума: ${b.stake}, кф: ${b.price}, статус: ${b.status}
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

async function deposit(amountInputId, outId) {
  const el = document.getElementById(amountInputId);
  const out = document.getElementById(outId);
  const amount = Number(el.value);
  if (!amount || amount <= 0) {
    out.textContent = 'Некоректна сума';
    return;
  }
  const res = await api('/api/user/deposit', 'POST', { amount }, true);
  out.textContent = res.error ? res.error : `Новий баланс: ${res.balance}`;
}
