let socket = null;
let userEmail = null;
let userId = null;
let gameId = null;

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/";
} else {
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  userEmail = decodedPayload.email;
  userId = decodedPayload.id;
  const welcomeMessageElement = document.getElementById("welcomeMessage");
  welcomeMessageElement.textContent = `Hello, ${userEmail}! Welcome to your dashboard.`;
}

const findMatchButton = document.getElementById("findMatchButton");
findMatchButton.addEventListener("click", () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    const WEBSOCKET_URL = "ws://localhost:8080";
    socket = new WebSocket(WEBSOCKET_URL, token);
    socket.onopen = () => {
      console.log(`client: Connected to WebSocket server : ${userEmail}`);
      sendFindMatchRequest();
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const matchStatusElement = document.getElementById("matchStatus");
      switch (data.type) {
        case "waiting":
            matchStatusElement.textContent = data.message;
            break;
        case "gameStart":
            matchStatusElement.textContent = `The game has started! Your opponent is ${data.payload.opponent}`;
            displayGame(data.payload);
            break;
        case "error":
            matchStatusElement.textContent = `Error: ${data.message}`;
            break;           
        case "gameEnd":
            break;       
        case 'gameResults':
            displayResultsTable(data.payload.results);
            break;
        default:
            console.log("Unknown message type:", data);
      }
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      document.getElementById("matchStatus").textContent = "WebSocket connection error.";
    };
    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  } else {
    // WebSocket is already open; send the request directly
    sendFindMatchRequest();
  }
});

function sendFindMatchRequest() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }
  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  const userId = decodedPayload.id;
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "findMatch",
        payload: { userId },
      })
    );
    document.getElementById("matchStatus").textContent = "Searching for a match...";
  } else {
    document.getElementById("matchStatus").textContent = "WebSocket connection not established.";
  }
}

function displayGame(payload) {
    const questions = payload.questions;
    gameId = payload.gameId;
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';
    questions.forEach((q, index) => {
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.setAttribute('data-questionid', q.id);
      questionElement.setAttribute('data-correctanswer', q.options[q.correctAnswer]);
      const questionText = document.createElement('p');
      questionText.textContent = `${index + 1}. ${q.text}`;
      questionElement.appendChild(questionText);
      questionElement.appendChild(document.createElement('br'));
      q.options.forEach((option) => {
        const optionLabel = document.createElement('label');
        const optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.name = `question${index}`;
        optionInput.value = option;
        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(document.createTextNode(option));
        questionElement.appendChild(optionLabel);
        questionElement.appendChild(document.createElement('br'));
      });   
      quizContainer.appendChild(questionElement);
      quizContainer.appendChild(document.createElement('br'));
    });
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    submitButton.addEventListener('click', submitQuiz);
    quizContainer.appendChild(submitButton);
}

function submitQuiz() {
    const responses = [];
    const quizContainer = document.getElementById('quizContainer');
    const questions = [...quizContainer.getElementsByClassName('question')];
    questions.forEach((q, index) => {
      const selectedOption = q.querySelector('input[type="radio"]:checked');  
      if (selectedOption) {
        const response = {
            questionId: q.dataset.questionid,
            recordedAnswer: selectedOption.value,
            correctAnswer: q.dataset.correctanswer
        };
        responses.push(response);
      }
    });
    const payload = {
        gameId: gameId,
        userId: userId,
        responses: responses
    };
    socket.send(JSON.stringify({
      type: 'submitQuiz',
      payload: payload
    }));
    const matchStatusElement = document.getElementById("matchStatus");
    matchStatusElement.textContent = '';
    quizContainer.innerHTML = '';
    const thankYouMessage = document.createElement('p');
    thankYouMessage.textContent = 'Thank you for submitting your responses! Waiting for opponent to finish.';
    quizContainer.appendChild(thankYouMessage);
}

function displayResultsTable(results) {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';
    const table = document.createElement('table');
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerQuestion = document.createElement('th');
    headerQuestion.textContent = 'Player';
    headerRow.appendChild(headerQuestion);
    const headerScore = document.createElement('th');
    headerScore.textContent = 'Score';
    headerRow.appendChild(headerScore);
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);
    const tableBody = document.createElement('tbody');
    for (const [playerId, score] of Object.entries(results.scores)) {
        const row = document.createElement('tr');
        const playerCell = document.createElement('td');
        playerCell.textContent = `Player ${playerId}`;
        row.appendChild(playerCell);
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score;
        row.appendChild(scoreCell);
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    quizContainer.appendChild(table);
    quizContainer.appendChild(document.createElement('br'));
    const winnerMessage = document.createElement('p');
    winnerMessage.textContent = `Winner: Player ${results.winner}`;
    quizContainer.appendChild(winnerMessage);
}

  
