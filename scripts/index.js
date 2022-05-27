const logContent = document.querySelector('.log-content');

const organizationInput = document.querySelector('#organization-input');
const projectInput = document.querySelector('#project-input');
const usernameInput = document.querySelector('#username-input');
const passwordInput = document.querySelector('#password-input');
const passwordEyeSlashButton = document.querySelector('.fa-eye-slash');
const passwordEyeButton = document.querySelector('.fa-eye');

const sendButton = document.querySelector('#send-btn');
const sendButtonLoader = document.querySelector('#send-btn + .loader');

const rawButton = document.querySelector('#raw-btn');
const downloadButton = document.querySelector('#download-btn');
const anchor = document.querySelector('#download-btn .download-anchor');
const filterCheckbox = document.querySelector('#filter-checkbox');

// Variáveis pra mostrar no log
let plansCollected = 0;
let suitesCollected = 0;
let pointsCollected = 0;

const localStorageData = JSON.parse(localStorage.getItem('inputs'));

// Se houver inputs salvos no local storage
if (localStorageData) {
  organizationInput.value = localStorageData.organization;
  projectInput.value = localStorageData.project;
  usernameInput.value = localStorageData.username;
  passwordInput.value = localStorageData.password;
}

sendButton.onclick = () => {
  const organization = organizationInput.value;
  const project = projectInput.value;
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (
    organization.length
    && project.length
    && username.length
    && password.length
  ) {
    showLoading();
    handleLocalStorage(organization, project, username, password);
    getData(organization, project, username, password);
  } else {
    logContent.innerHTML = 
      `<p class="red-highlight">
        Por favor, preencha todos os campos!
      </p>`;
  }
}

const showLoading = () => {
  sendButton.style.display = 'none';
  sendButtonLoader.style.display = 'block';
}

const handleLocalStorage = (
  organization,
  project,
  username,
  password
) => {
  const data = { organization, project, username, password }
  localStorage.setItem('inputs', JSON.stringify(data));
}

const showSendButton = () => {
  sendButton.style.display = 'block';
  sendButtonLoader.style.display = 'none';
}

passwordEyeSlashButton.onclick = () => {
  passwordEyeSlashButton.style.display = 'none';
  passwordEyeButton.style.display = 'block';

  passwordInput.type = 'text';
}

passwordEyeButton.onclick = () => {
  passwordEyeButton.style.display = 'none';
  passwordEyeSlashButton.style.display = 'block';

  passwordInput.type = 'password';
}

/* Raw e Download do JSON */

rawButton.onclick = () => {
  setupDownload(dataCollected);
  window.open(anchor.href, "_blank");
}

downloadButton.onclick = () => {
  setupDownload(dataCollected);
  anchor.click();
}

function setupDownload(data) {
  const fileName = 'Dados Test Points.json';
  const fileType = 'application/json';

  const json = JSON.stringify(data);

  const blob = new Blob([json], { type: fileType });

  anchor.download = fileName;

  if (
    window.navigator 
    && window.navigator.msSaveOrOpenBlob 
    && !window.navigator.userAgent.indexOf('Edge/')
  ) {
    anchor.onclick = function() { window.navigator.msSaveOrOpenBlob(blob, fileName) };
  } else {
    // Usar (window.webkitURL || window.URL).createObjectURL(blob) caso precise suportar webKitURL.
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadUrl = [fileType, anchor.download, anchor.href].join(':');
  }
}