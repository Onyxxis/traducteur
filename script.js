// Configuration de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const translateBtn = document.getElementById('translateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const targetLanguage = document.getElementById('targetLanguage');
    const resultSection = document.getElementById('resultSection');
    const originalPdfViewer = document.getElementById('originalPdfViewer');
    const translatedPdfViewer = document.getElementById('translatedPdfViewer');
    const statusDiv = document.getElementById('status');
    
    let pdfFile = null;
    let translatedPdfUrl = null;
    
    // Gestion du drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                pdfFile = file;
                translateBtn.disabled = false;
                showStatus('Fichier PDF prêt à être traduit', 'success');
                
                // Afficher l'aperçu du PDF original
                const fileUrl = URL.createObjectURL(file);
                originalPdfViewer.src = fileUrl;
            } else {
                showStatus('Veuillez sélectionner un fichier PDF valide', 'error');
            }
        }
    }
    
    // Traduction du PDF
    translateBtn.addEventListener('click', async function() {
        if (!pdfFile) return;
        
        const language = targetLanguage.value;
        translateBtn.disabled = true;
        showStatus('Traduction en cours...', '');
        
        try {
            // Extraire le texte du PDF
            const text = await extractTextFromPdf(pdfFile);
            
            // Traduire le texte (simulation avec une fonction locale)
            const translatedText = await simulateTranslation(text, language);
            
            // Créer un nouveau PDF avec le texte traduit
            const translatedPdf = await createTranslatedPdf(translatedText);
            
            // Afficher le résultat
            translatedPdfUrl = URL.createObjectURL(translatedPdf);
            translatedPdfViewer.src = translatedPdfUrl;
            
            resultSection.style.display = 'block';
            showStatus('Traduction terminée avec succès', 'success');
            translateBtn.disabled = false;
        } catch (error) {
            console.error('Erreur de traduction:', error);
            showStatus('Erreur lors de la traduction: ' + error.message, 'error');
            translateBtn.disabled = false;
        }
    });
    
    // Téléchargement du PDF traduit
    downloadBtn.addEventListener('click', function() {
        if (!translatedPdfUrl) return;
        
        const link = document.createElement('a');
        link.href = translatedPdfUrl;
        link.download = 'document_traduit.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Fonction pour extraire le texte d'un PDF
    async function extractTextFromPdf(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const textItems = textContent.items.map(item => item.str);
                        fullText += textItems.join(' ') + '\n\n';
                    }
                    
                    resolve(fullText);
                } catch (error) {
                    reject(error);
                }
            };
            
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    }
    
    // Simulation de traduction (en production, utiliser une API comme Google Translate)
    async function simulateTranslation(text, targetLang) {
        // Dans une vraie application, vous utiliseriez une API de traduction ici
        // Ceci est une simulation qui ajoute simplement un préfixe au texte
        const langNames = {
            en: 'Anglais',
            es: 'Espagnol',
            fr: 'Français',
            de: 'Allemand',
            it: 'Italien',
            pt: 'Portugais',
            ru: 'Russe',
            zh: 'Chinois',
            ja: 'Japonais',
            ar: 'Arabe'
        };
        
        return `[Traduit en ${langNames[targetLang]}]\n\n${text}`;
    }
    
    // Création d'un PDF traduit (simplifié)
    async function createTranslatedPdf(text) {
        // Dans une vraie application, vous utiliseriez une bibliothèque comme pdf-lib
        // Ceci est une simulation qui crée un simple Blob avec le texte
        
        const blob = new Blob([text], { type: 'application/pdf' });
        return blob;
    }
    
    // Affichage des messages de statut
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status';
        
        if (type) {
            statusDiv.classList.add(type);
        }
    }

    
});