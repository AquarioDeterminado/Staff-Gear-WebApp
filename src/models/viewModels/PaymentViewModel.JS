class PaymentViewModel {

    constructor({BusinessEntityID, Name, Amount, Date}) {
        this.BusinessEntityID = BusinessEntityID;
        this.Name = Name;
        this.Amount = Amount;
        this.Date = Date;
    }
}

export default PaymentViewModel;