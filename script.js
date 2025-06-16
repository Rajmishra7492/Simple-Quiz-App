document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    const submitBtn = document.getElementById('submit-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const modal = document.getElementById('result-modal');
    const closeBtn = document.querySelector('.close');
    const resultContent = document.getElementById('result-content');
    const scoresList = document.getElementById('scores-list');
    const timeDisplay = document.getElementById('time');
    const progressBar = document.getElementById('progress-bar');
    const tryAgainBtn = document.getElementById('try-again-btn');

    let currentQuestion = 0;
    let timeLeft = 120; // 2 minutes in seconds
    let timer;
    let shuffledQuestions = [];

    // Reset quiz state
    function resetQuiz() {
        // Clear the quiz form
        quizForm.innerHTML = '';
        
        // Reset variables
        currentQuestion = 0;
        timeLeft = 120;
        clearInterval(timer);
        
        // Reset progress bar
        progressBar.style.width = '0%';
        
        // Reset timer display
        timeDisplay.textContent = '02:00';
        
        // Hide modal
        modal.style.display = 'none';
        
        // Generate new quiz
        generateQuiz();
    }

    // Shuffle array function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Shuffle questions and options
    function shuffleQuestions() {
        shuffledQuestions = questions.map(q => ({
            ...q,
            options: shuffleArray([...q.options])
        }));
        return shuffleArray([...shuffledQuestions]);
    }

    // Update timer display
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }

    // Start timer
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            updateTimer();
        }, 1000);
    }

    // Update progress bar
    function updateProgressBar() {
        const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Generate quiz questions
    function generateQuiz() {
        shuffledQuestions = shuffleQuestions();
        shuffledQuestions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            questionDiv.innerHTML = `
                <h3>${index + 1}. ${q.question}</h3>
                <div class="options">
                    ${q.options.map((option, optIndex) => `
                        <label class="option">
                            <input type="radio" name="q${index}" value="${option}" required>
                            ${option}
                        </label>
                    `).join('')}
                </div>
                <div class="error">Please select an answer</div>
            `;
            quizForm.appendChild(questionDiv);
        });
        showQuestion(0);
        startTimer();
    }

    // Show specific question
    function showQuestion(index) {
        const questions = document.querySelectorAll('.question');
        questions.forEach((q, i) => {
            q.classList.remove('active');
            if (i === index) {
                q.classList.add('active');
            }
        });

        // Update navigation buttons
        prevBtn.disabled = index === 0;
        nextBtn.style.display = index === questions.length - 1 ? 'none' : 'block';
        submitBtn.style.display = index === questions.length - 1 ? 'block' : 'none';

        updateProgressBar();
    }

    // Save score to local storage
    function saveScore(score) {
        const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
        const newScore = {
            date: new Date().toLocaleDateString(),
            score: score,
            total: shuffledQuestions.length
        };
        scores.push(newScore);
        localStorage.setItem('quizScores', JSON.stringify(scores));
        displayScores();
    }

    // Display scores from local storage
    function displayScores() {
        const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
        scoresList.innerHTML = scores.map(score => `
            <div class="score-item">
                ${score.date}: ${score.score}/${score.total} correct
            </div>
        `).join('');
    }

    // Validate form
    function validateForm() {
        let isValid = true;
        const questions = document.querySelectorAll('.question');
        
        questions.forEach(question => {
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            const errorDiv = question.querySelector('.error');
            
            if (!selectedOption) {
                errorDiv.style.display = 'block';
                isValid = false;
            } else {
                errorDiv.style.display = 'none';
            }
        });
        
        return isValid;
    }

    // Calculate score
    function calculateScore() {
        let score = 0;
        shuffledQuestions.forEach((q, index) => {
            const selectedAnswer = document.querySelector(`input[name="q${index}"]:checked`).value;
            if (selectedAnswer === q.correctAnswer) {
                score++;
            }
        });
        return score;
    }

    // Submit quiz
    function submitQuiz() {
        clearInterval(timer);
        if (validateForm()) {
            const score = calculateScore();
            saveScore(score);
            showResult(score);
        }
    }

    // Show result modal
    function showResult(score) {
        const percentage = (score / shuffledQuestions.length) * 100;
        let message = '';
        let messageClass = '';

        if (percentage > 80) {
            message = 'Great job! 🎉';
            messageClass = 'great';
        } else if (percentage >= 50) {
            message = 'Good effort! 👍';
            messageClass = 'good';
        } else {
            message = 'Try again! 💪';
            messageClass = 'try-again';
        }

        resultContent.innerHTML = `
            <div class="score">You got ${score} out of ${shuffledQuestions.length} correct!</div>
            <div class="message ${messageClass}">${message}</div>
        `;
        modal.style.display = 'block';
    }

    // Event Listeners
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        submitQuiz();
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestion < shuffledQuestions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    tryAgainBtn.addEventListener('click', () => {
        resetQuiz();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize quiz
    generateQuiz();
    displayScores();
}); 