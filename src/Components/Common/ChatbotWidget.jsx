import { useEffect } from 'react';

const ChatbotWidget = () => {
    useEffect(() => {
        // Check if the script is already present
        if (document.querySelector('script[src="https://cdn.jsdelivr.net/npm/@denserai/embed-chat@1/dist/web.min.js"]')) {
            return;
        }

        // Create the script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@denserai/embed-chat@1/dist/web.min.js';
        script.type = 'module';
        script.async = true;

        script.onload = () => {
            // Initialize after script loads
            import('https://cdn.jsdelivr.net/npm/@denserai/embed-chat@1/dist/web.min.js')
                .then((module) => {
                    const Chatbot = module.default || module;
                    if (Chatbot && typeof Chatbot.init === 'function') {
                        Chatbot.init({
                            chatbotId: 'chatbot_t3f251us033dv5wxa4fct',
                        });
                    }
                })
                .catch(err => console.error('Error loading Chatbot module:', err));
        };

        document.head.appendChild(script);

        // Alternative: if the module is already loaded or script is fast
        // We can try to initialize directly in a separate script tag or via the module import
        const initScript = document.createElement('script');
        initScript.type = 'module';
        initScript.innerHTML = `
      import Chatbot from "https://cdn.jsdelivr.net/npm/@denserai/embed-chat@1/dist/web.min.js";
      Chatbot.init({
        chatbotId: "chatbot_t3f251us033dv5wxa4fct",
      });
    `;
        document.head.appendChild(initScript);

        return () => {
            // Cleanup if necessary, though chatbot widgets often stick around
            // document.head.removeChild(script);
            // document.head.removeChild(initScript);
        };
    }, []);

    return null;
};

export default ChatbotWidget;
