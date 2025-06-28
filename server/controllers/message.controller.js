
import  Message  from "../models/message.model.js";
import  Conversation from "../models/conversation.model.js";

export const sendMessage = async (req, res) => {
    try{
        const senderId = req.id;
        const receiverId = req.params.id;
        const{message} = req.body;

        let conversation = await Conversation
            .findOne({ participant: { $all: [senderId, receiverId] } });
        //establish the coversation if not started

        if(!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId],
                
            });
            await conversation.save();
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            conversationId: conversation._id
        });

        if(newMessage){
            conversation.message.push(newMessage._id);
            await Promise.all([
                newMessage.save(),
                conversation.save()
            ]);
        }

        //implement socket io for real time message transfer

        res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage
        });

    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessage = async (req, res) => {
    try{
       const senderId = req.id;
       const receiverId = req.params.id;
         const conversation = await Conversation
              .findOne({ participants: { $all: [senderId, receiverId] } })
    
       if(!conversation) {
           return res.status(200).json({ messages: "[]",
            success: true,
            });
       }

       return res.status(200).json({
           message: "Messages fetched successfully",
           success: true,
           messages: conversation.messages
       });


    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


