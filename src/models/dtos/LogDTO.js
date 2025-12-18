class LogDTO
{   
    constructor({LogID, ActorID, Target,  Action,  CreatedAt}) {
        this.LogID = LogID;
        this.ActorID = ActorID || null;
        this.Target = Target || null;
        this.Action = Action || null;
        this.CreatedAt = CreatedAt || null;
     }
} 

export default LogDTO;

