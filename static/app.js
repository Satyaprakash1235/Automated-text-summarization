document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.querySelector('.file-name');
    const generateBtn = document.getElementById('generate-btn');
    const resultsSection = document.getElementById('results-section');
    const loadingOverlay = document.getElementById('loading-overlay');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    let selectedFile = null;

    // Drag and Drop handlers
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file.');
            return;
        }
        selectedFile = file;
        fileNameDisplay.textContent = file.name;
        fileInfo.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }

    // Generate Notes handler
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        loadingOverlay.classList.remove('hidden');

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Upload failed');
            }

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing PDF: ' + error.message);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });

    function displayResults(data) {
        // Display Summary
        document.querySelector('.notes-content').textContent = data.notes || 'No summary available.';

        // Display Points
        const pointsList = document.querySelector('.points-content');
        pointsList.innerHTML = '';
        if (data.points && data.points.length > 0) {
            data.points.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                pointsList.appendChild(li);
            });
        } else {
            pointsList.innerHTML = '<li>No key points extracted.</li>';
        }

        // Display Questions
        const questionsList = document.querySelector('.questions-content');
        questionsList.innerHTML = '';
        if (data.questions && data.questions.length > 0) {
            data.questions.forEach(q => {
                const li = document.createElement('li');
                li.textContent = q;
                questionsList.appendChild(li);
            });
        } else {
            questionsList.innerHTML = '<li>No questions generated.</li>';
        }

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Tab switching logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
