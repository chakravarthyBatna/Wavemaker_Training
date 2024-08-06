document.addEventListener('DOMContentLoaded', function() {
    // Fetch data from the API
    fetch('https://randomuser.me/api/')
        .then(response => response.json())
        .then(data => {
            const user = data.results[0]; // Assuming you want the first user
            console.log(user);

            // Populate form fields with the fetched data
            document.getElementById('fname').value = user.name.first;
            document.getElementById('lname').value = user.name.last;
            document.getElementById('email').value = user.email;
            document.getElementById('age').value = user.dob.age;

            // The Random User API does not include a 'location' field, so we'll skip this
            document.getElementById('source').value = 'Employed'; // Set default value for select
            document.getElementById('income').value = 20000; // Example income
            document.getElementById('incomeValue').textContent = '20k'; // Example income display

            // Set gender based on fetched data
            if (user.gender === 'female') {
                document.getElementById('female').checked = true;
            } else if (user.gender === 'male') {
                document.getElementById('male').checked = true;
            }

            // Set hobbies based on fetched data (assuming an array of hobbies)
            const hobbies = ['music', 'sports', 'travel', 'movies']; // Example hobbies
            hobbies.forEach(hobby => {
                const checkbox = document.getElementById(hobby);
                if (checkbox) {
                    checkbox.checked = true; // Check each hobby
                }
            });

            // Handle form submission
            document.getElementById('createAccountForm').addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent the default form submission
                
                // Collect form data
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries()); // Fixed the extra parenthesis
                console.log(data);
                
                // Send data to the server (example URL)
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
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Update income display as slider changes
    document.getElementById('income').addEventListener('input', function() {
        document.getElementById('incomeValue').textContent = `${this.value / 1000}k`;
    });
    
});