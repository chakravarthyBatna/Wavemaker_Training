document.addEventListener('DOMContentLoaded', () => {
    const api = 'https://randomuser.me/api/';
    fetch(api)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            const user = data.results[0];

            document.getElementById('firstname').value = user.name.first;
            document.getElementById('lastname').value = user.name.last;
            document.getElementById('email').value = user.email;
            document.getElementById('age').value = user.dob.age;

            document.getElementById('password').value = user.login.password;
            document.getElementById('confirmPassword').value = user.login.password;

           
            if (user.gender === 'male') {
                document.getElementById('male').checked = true;
            } else if (user.gender === 'female') {
                document.getElementById('female').checked = true;
            }

           
            const hobbies = ['music', 'sports', 'travel', 'movies'];
            hobbies.forEach(hobby => {
                const checkbox = document.getElementById(hobby);
                if (checkbox) {
                    checkbox.checked = true; 
                }
            });

            document.getElementById('bio').value = 'No bio available';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

  
    document.getElementById('createAccountForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
     
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        console.log(data);

        
        fetch('https://reqres.in/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Form submission failed.');
        });
    });

    document.getElementById('income').addEventListener('input', function() {
        document.getElementById('incomeValue').textContent = `${this.value / 1000}k`;
    });
});
