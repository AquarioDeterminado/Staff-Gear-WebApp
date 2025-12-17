class PaymentViewModel {

    constructor({BusinessEntityID, FullName, Rate, PayFrequency, RateChangeDate}) {
        this.BusinessEntityID = BusinessEntityID;
        this.FullName = FullName;
        this.Rate = Rate;
        this.PayFrequency = PayFrequency;
        this.RateChangeDate = RateChangeDate;
    }
}

export default PaymentViewModel;