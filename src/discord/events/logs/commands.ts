import { createEvent } from "#base";

createEvent({
    name: "Command Logger",
    event: "interactionCreate",
    run(interation) {
        if(interation.isCommand()) {
            
        }
    }
});