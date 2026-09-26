const authView = document.querySelector('#auth-view');
const homeView = document.querySelector('#home-view');
const headerActions = document.querySelector('#header-actions');
const message = document.querySelector('#message');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const authTitle = document.querySelector('#auth-title');
const authDescription = document.querySelector('#auth-copy p');
const auditLabels = {
  'account.created': 'Conta criada',
  'auth.login_success': 'Entrada na conta',
  'auth.logout': 'Saída da conta',
  'address.cep_lookup': 'Consulta de endereço',
};

function showMessage(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle('error', isError);
  element.hidden = false;
}

function clearMessage(element) {
  element.textContent = '';
  element.classList.remove('error');
  element.hidden = true;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a solicitação.');
  return result;
}

function setMode(mode) {
  const isRegister = mode === 'register';
  loginForm.hidden = isRegister;
  registerForm.hidden = !isRegister;
  authTitle.textContent = isRegister ? 'Vamos criar seu acesso.' : 'Que bom ter você aqui.';
  authDescription.textContent = isRegister
    ? 'É rápido. Você pode revisar os dados antes de continuar.'
    : 'Entre para continuar de onde parou.';
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  clearMessage(message);
}

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(message);
  const form = new FormData(loginForm);
  try {
    await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });
    await loadAccount();
  } catch (error) {
    showMessage(message, error.message, true);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(message);
  const form = new FormData(registerForm);
  try {
    await request('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        acceptedTerms: form.has('acceptedTerms'),
        acceptedPrivacy: form.has('acceptedTerms'),
      }),
    });
    await loadAccount();
  } catch (error) {
    showMessage(message, error.message, true);
  }
});

async function loadAudit() {
  const list = document.querySelector('#audit-list');
  list.replaceChildren();
  const { events } = await request('/api/audit');
  if (events.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'Ainda não há atividade registrada.';
    list.append(item);
    return;
  }
  events.forEach((event) => {
    const item = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = 'audit-dot';
    dot.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    const title = document.createElement('span');
    title.className = 'audit-event';
    title.textContent = auditLabels[event.event] ?? 'Atividade da conta';
    const date = document.createElement('span');
    date.className = 'audit-date';
    date.textContent = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(`${event.created_at.replace(' ', 'T')}Z`));
    text.append(title, date);
    item.append(dot, text);
    list.append(item);
  });
}

async function loadAccount() {
  try {
    const { user } = await request('/api/me');
    authView.hidden = true;
    homeView.hidden = false;
    document.querySelector('#user-name').textContent = user.name;
    document.querySelector('#user-email').textContent = user.email;
    const greeting = document.createElement('span');
    greeting.className = 'header-user';
    greeting.textContent = user.name;
    headerActions.replaceChildren(greeting);
    await loadAudit();
  } catch {
    authView.hidden = false;
    homeView.hidden = true;
    headerActions.replaceChildren();
  }
}

document.querySelector('#logout-button').addEventListener('click', async () => {
  try {
    await request('/api/logout', { method: 'POST' });
    homeView.hidden = true;
    authView.hidden = false;
    headerActions.replaceChildren();
    loginForm.reset();
    setMode('login');
  } catch (error) {
    window.alert(error.message);
  }
});

document.querySelector('#cep').addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
  event.target.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
});

document.querySelector('#cep-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const cep = document.querySelector('#cep').value.replace(/\D/g, '');
  const cepMessage = document.querySelector('#cep-message');
  const result = document.querySelector('#address-result');
  clearMessage(cepMessage);
  result.hidden = true;
  try {
    const address = await request(`/api/cep/${encodeURIComponent(cep)}`);
    Object.entries(address).forEach(([key, value]) => {
      document.querySelector(`[data-address="${key}"]`).textContent = value || 'Não informado';
    });
    result.hidden = false;
  } catch (error) {
    showMessage(cepMessage, error.message, true);
  }
});

loadAccount();
