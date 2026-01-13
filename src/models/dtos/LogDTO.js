class LogDTO
{   
    constructor({LogID, ActorID, Target,  Action, Description, CreatedAt}) {
        this.LogID = LogID;
        this.ActorID = ActorID || null;
        this.Target = Target || null;
        this.Action = Action || null;
        this.Description = Description || null;
        this.CreatedAt = CreatedAt || null;
     }
} 

export default LogDTO;

