const addTerms = document.getElementById('add-terms')
const createSetForm = document.getElementById('create-set-form')


let termIndex = 1;
addTerms.addEventListener('click', (e) => { 
    e.preventDefault();  
    if (termIndex > 25) {
        alert('25 is the max for a set')
        //---------------!!!RESET termIndex WHEN SET IS SUBMITTED!!!---------------
        return;
    }
    const anotherTermDiv = document.createElement('div'); 
    
    //i in this for loop is separate from termIndex variable because the button can be pressed several times
    //The limiter in the for loop limits the number of additional fields produced, but does not affect input name
    for(let i = 0; i < 2; i++) {
         
        let anotherTerm = `
            <div>
                <label for="learnText${termIndex}">${termIndex +1} ) Word or phrase you want to learn:</label>
                <input type="text" name="learnText${termIndex}" />
                <label for="nativeText${termIndex}">How it's said in your 1st language:</label>
                <input type="text" name="nativeText${termIndex}" />
            </div>
        `  
        termIndex++;
        anotherTermDiv.insertAdjacentHTML('beforeend', anotherTerm)
    }
    createSetForm.appendChild(anotherTermDiv);

});
