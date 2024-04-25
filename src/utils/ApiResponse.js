class ApiResponse {
    constructor(statusode,data,message="Success"){
         this.statusode =statusode
         this.data =data
         this.message= message
         this.success = statusode < 400
    }
}

export default ApiResponse