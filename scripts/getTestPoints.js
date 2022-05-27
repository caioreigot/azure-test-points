let isFetchingData = false;
let dataCollected = [];

function getData(
  organization,
  project,
  username,
  password
) {
  /* Se esta função já estiver rodando, não
  rodar novamente caso o usuário tente */
  if (isFetchingData) {
    logContent.innerHTML +=
      `<p class="red-highlight">Aguarde, o programa já está buscando pelos dados!</p>`
    
    return;
  }

  isFetchingData = true;
  clearLastResult();

  const fetchOptions = {
    method: 'get',
    headers: {
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    }
  }

  // Endpoint da API que pega todos os Plans
  const getPlansUrl = `https://dev.azure.com/${organization}/${project}/_apis/test/Plans/`;

  // Pegando todos os "Plans"
  fetch(getPlansUrl, fetchOptions)
    .then(response => response.json())
    .then(plansData => getSuites(plansData.value))
    .catch(handleError);

  // Pega todos os "Suites" dentro de cada "Plan"
  function getSuites(plans) {
    increasePlansCollected(plans.length);

    for (let i = 0; i < plans.length; i++) {
      const currentPlanId = plans[i].id;

      // Pegando todas "Suites" do "Plan" atual
      const getSuitesUrl = `https://dev.azure.com/${organization}/${project}/_apis/test/Plans/${currentPlanId}/suites?api-version=5.0`
      
      // Manda todas as "Suits" de uma "Plain" para a função getPoints
      setTimeout(() => {
        fetch(getSuitesUrl, fetchOptions)
          .then(response => response.json())
          .then(suitesData => {
            increaseSuitesCollected(suitesData.value.length);
            getPoints(currentPlanId, suitesData.value);
          })
          .catch(handleError);
      // Delay de 20ms entre cada requisição
      }, i * 20);
    }
  }

  // Pega todos os "Points" de cada "Suite"
  function getPoints(planId, suites) {
    for (let i = 0; i < suites.length; i++) {
      const getPointsUrl = `https://dev.azure.com/${organization}/${project}/_apis/test/Plans/${planId}/Suites/${suites[i].id}/points?api-version=6.0`;

      setTimeout(() => {
        fetch(getPointsUrl, fetchOptions)
          .then(response => response.json())
          .then(pointsData => {
            // Aplicando filtros para os dados coletados caso o usuário tenha ativado
            const processedPointsData = filterCheckbox.checked 
              ? applyFilters(pointsData)
              : pointsData;

            // Passando os dados para o array "dataCollected"
            dataCollected.push(processedPointsData);

            increasePointsCollected(pointsData.value.length || 1);
          })
          .catch(handleError);
      // Delay de 20ms entre cada requisição
      }, i * 20);
    }
  }

  // Regras de filtros para o Point Data
  function applyFilters(pointsData) {
    const processedPointsData = [];
    
    pointsData.value.forEach(point => {
      delete point.testCase.url;
      delete point.testCase.webUrl;

      processedPointsData.push(
        { 
          outcome: point.outcome,
          testCase: point.testCase 
        }
      );
    });

    return processedPointsData;
  }
}

const increasePlansCollected = (amount) => {
  plansCollected += amount;
  updateLog();
}

const increaseSuitesCollected = (amount) => {
  suitesCollected += amount;
  updateLog();
}

const increasePointsCollected = (amount) => {
  pointsCollected += amount;
  updateLog();
}

const clearLastResult = () => {
  dataCollected = [];
  
  plansCollected = 0;
  suitesCollected = 0;
  pointsCollected = 0;
}

// Usado para armazenar o ID do intervalo definido na função "updateLog"
let refreshInterval;

const updateLog = () => {
  if (refreshInterval) {
    window.clearInterval(refreshInterval);
  }

  // Só entra caso esta função (updateLog) não for chamada durante 2s e meio
  refreshInterval = setInterval(() => {
    logContent.innerHTML += '<br><br>'
    + `<p class="green-highlight">Processo finalizado! O download está pronto.</p>`
    
    window.clearInterval(refreshInterval);

    isFetchingData = false;
    showSendButton();
  }, 2500);

  logContent.innerHTML = 
    `Plans coletados: <strong>${plansCollected}</strong><br>` +
    `Suites coletados: <strong>${suitesCollected}</strong><br>` +
    `Points coletados: <strong>${pointsCollected}</strong>`;
}

const handleError = (err) => {
  logContent.innerHTML += 
    `<p class="red-highlight">
      ${err}
    </p>`

  isFetchingData = false;
  showSendButton();
}