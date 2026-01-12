class LogDTO
{   
    constructor({LogID, ActorID, ActorName, Target,  Action,  CreatedAt}) {
        this.LogID = LogID;
        this.ActorID = ActorID || null;
        this.ActorName = ActorName || null;
        this.Target = Target || null;
        this.Action = Action || null;
        this.CreatedAt = CreatedAt || null;
     }
} 

export default LogDTO;

