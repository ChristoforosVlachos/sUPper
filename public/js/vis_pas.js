const togglePassword = document.querySelectorAll(".togglePassword");
const password = document.querySelectorAll(".password");



for(let i=0; i<togglePassword.length; i++){
    togglePassword[i].addEventListener("click", function(){
        const type = password[i].getAttribute("type") === "password" ? "text" : "password";
        password[i].setAttribute("type", type);
        this.classList.toggle("bi-eye");
    })
}
