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
