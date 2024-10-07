import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
 MainContainer,
 ChatContainer,
 MessageList,
 Message,
 MessageInput,
 TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const OPENAI_API_KEY = "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";

function App() {
 // State to manage the typing indicator of the chatbot
 const [isChatbotTyping, setIsChatbotTyping] = useState(false);

 // State to store chat messages
 const [chatMessages, setChatMessages] = useState<any>([]);

 // Function to handle user messages
 const handleUserMessage = async (userMessage:any) => {
   // Create a new user message object
   const newUserMessage = {
     message: userMessage,
     sender: "user",
     direction: "outgoing",
   };

   // Update chat messages state with the new user message
   const updatedChatMessages = [...chatMessages, newUserMessage];
   setChatMessages(updatedChatMessages);

   // Set the typing indicator for the chatbot
   setIsChatbotTyping(true);

   // Process user message with ChatGPT
   await processUserMessageToChatGPT(updatedChatMessages);
 };

 // Function to send the user message to ChatGPT API
 async function processUserMessageToChatGPT(messages: any) {
   // Prepare the messages in the required format for the API
   let apiMessages = messages.map((messageObject: any) => {
     let role = "";
     if (messageObject.sender === "ChatGPT") {
       role = "assistant";
     } else {
       role = "user";
     }
     return { role: role, content: messageObject.message };
   });

   // System message for ChatGPT
   const systemMessage = {
     role: "system",
     content: "Explain all concept like a Professor in Biochemistry",
   };

   // Prepare the API request body
   const apiRequestBody = {
     model: "gpt-3.5-turbo",
     messages: [
       systemMessage, // System message should be in front of user messages
       ...apiMessages,
     ],
   };

   // Send the user message to ChatGPT API
   await fetch("https://api.openai.com/v1/chat/completions", {
     method: "POST",
     headers: {
       Authorization: "Bearer " + OPENAI_API_KEY,
       "Content-Type": "application/json",
     },
     body: JSON.stringify(apiRequestBody),
   })
     .then((data) => {
       return data.json();
     })
     .then((data) => {
       // Update chat messages with ChatGPT's response
       console.log(data)
       setChatMessages([
         ...messages,
         {
           message: data.choices[0].message.content,
           sender: "ChatGPT",
         },
       ]);
       // Set the typing indicator to false after getting the response
       setIsChatbotTyping(false);
     });
 }

 return (
   <>
     {/* A container for the chat window */}
     <div style={{ position: "relative", height: "100vh", width: "700px" }}>
       <MainContainer>
         <ChatContainer>
           {/* Display chat messages and typing indicator */}
           <MessageList
             typingIndicator={
               isChatbotTyping ? (
                 <TypingIndicator content="Собеседник думает" />
               ) : null
             }
           >
             {/* Map through chat messages and render each message */}
             {chatMessages.map((message: any, i: any) => {
               return (
                 <Message
                   key={i}
                   model={message}
                   style={
                     message.sender === "Собеседник" ? { textAlign: "left" } : {}
                   }
                 />
               );
             })}
           </MessageList>
           {/* Input field for the user to type messages */}
           <MessageInput
             placeholder="Впишите сообщение сюда"
             onSend={handleUserMessage}
           />
         </ChatContainer>
       </MainContainer>
     </div>
   </>
 );
}

export default App;
