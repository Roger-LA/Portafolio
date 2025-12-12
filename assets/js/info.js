
let typedInstance = null; 


function initializeTypedJS() {
    if (typedInstance) {
        typedInstance.destroy();
        typedInstance = null; 
    }
    

    var typedElement = document.querySelector('.typed');

    if (typedElement && typeof Typed !== 'undefined') {
        typedInstance = new Typed('.typed', {
            strings: typedElement.getAttribute('data-typed-items').split(',').map(s => s.trim()),
            typeSpeed: 50,
            backSpeed: 50,
            loop: true
        });
    }
}


function applyLocalization(data) {
    if (!data || typeof data !== 'object') return;

    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

        const value = data[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            applyLocalization(value);
        } else if (typeof value === 'string') {
            const element = document.getElementById(key);

            if (element) {
                element.innerHTML = value; 
                
                if (key === 'title') {
                    document.title = value;
                }
            }
        }
    }
}


function getSavedLanguage() {
    return localStorage.getItem('userLang') || 'es';
}

function updateLanguageButton(langCode) {
    const langText = langCode.toUpperCase();
    const currentLangText = document.getElementById('current-lang-text');
    const langToggle = document.getElementById('lang-toggle');
    
    if (currentLangText) {
        currentLangText.textContent = langText;
    }
    if (langToggle) {
        langToggle.setAttribute('data-current-lang', langCode);
    }
}


function setCVDownloadLink(langCode, langData) {
    const downloadButton = document.getElementById('btn_descargar_cv');

    if (downloadButton) {
        const cvUrls = langData.index_page.resumen_page_data; 
        
        if (cvUrls) {
            const cvUrl = (langCode === 'en' && cvUrls.cv_url_en) 
                                ? cvUrls.cv_url_en
                                : cvUrls.cv_url_es; 
            
            downloadButton.href = cvUrl;

            const fileName = langCode === 'en' ? 'Rogelio_Luis_Almazan_EN.pdf' : 'Rogelio_Luis_Almazan_ES.pdf';
            downloadButton.setAttribute('download', fileName);
        }
    } 
}

async function loadAndApplyLocalization(langCode, jsonPath) {
    try {

        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar el archivo de localización desde ${jsonPath}`);
        }
        
        const fullLocalizationData = await response.json();
        const langData = fullLocalizationData[langCode];
        
        if (!langData) {
            throw new Error(`Datos de localización no encontrados para el idioma: ${langCode}`);
        }

        applyLocalization(langData);

        setCVDownloadLink(langCode, langData);

        initializeTypedJS();

        updateLanguageButton(langCode);


    } catch (error) {
        console.error('Fallo en la carga y aplicación de la localización:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // idioma guardado en localStorage, o 'es' por defecto.
    const currentLang = getSavedLanguage(); 
    const jsonPath = './localizationData.json'; 
    
    loadAndApplyLocalization(currentLang, jsonPath);

    document.querySelectorAll('.lang-option').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = e.currentTarget.getAttribute('data-lang');
            
            if (newLang) {

                localStorage.setItem('userLang', newLang);
                
                
                loadAndApplyLocalization(newLang, jsonPath); 
            }
        });
    });
});

