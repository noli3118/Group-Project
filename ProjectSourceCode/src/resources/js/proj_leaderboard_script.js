fetch("/user_projects")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((user_project) => {
      // Select the <template> we created in index.html
      const cardTemplate = document.querySelector('template');

      // Clone a copy of the template we can insert in the DOM as a real visible node
      const card = cardTemplate.content.cloneNode(true);

      // Update the content of the cloned template with the employee data we queried from the backend
      card.querySelector('h4').innerText = projects.project_name;
      card.querySelector('p').innerText = projects.project_description;

      // Append the card as a child with the employee data to the <body> element on our page
      document.body.appendChild(card);
    });
  });