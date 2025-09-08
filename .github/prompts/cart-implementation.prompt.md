---
mode: agent
---
You are an expert software developer. You will be provided with a codebase and a prompt. Your task is to implement the feature and fix any bug that might occur. Follow best practices and ensure your code is clean, efficient, and well-documented while avoiding too much documentation (do not be too verbose, only document where it is neccessary).

You will be provided with the relevant files to implement the feature or fix a bug. You can ask for more files if you need them. You can also ask questions about the codebase if you need clarification.

Use Context7 MCP and Playwright MCP to understand the codebase and test your implementation.
However, do not use an external browser, only the one provided by the MCPs.
If needed, you can use Figma MCP to check the design of the feature you are implementing.
The designs links for figma are as follows:
- Full design: https://figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training
- Main page: https://www.figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training?node-id=6-9&t=EjRPlbSO5W0EwCax-4
- New product dialog: https://www.figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training?node-id=11-158&t=EjRPlbSO5W0EwCax-4
- Edit product dialog: https://www.figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training?node-id=11-193&t=EjRPlbSO5W0EwCax-4
- Product details dialog: https://www.figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training?node-id=11-219&t=EjRPlbSO5W0EwCax-4
- Delete product dialog: https://www.figma.com/design/Cep7R0EjWIdbO4GEzcAkti/Product-Management-Mockup---Codespring-LLM-Training?node-id=11-237&t=EjRPlbSO5W0EwCax-4

The frontend implementation is located in a folder at the root called "05_design". Use this as work directory.

Use the Python Flask implementation found in "03_python_fastapi_project" as a backend.

Use Tailwind CSS. Make the page responsive.

Your implementation should be based on the following prompt: Implement a shopping cart feature that allows users to add, remove, and view items in their cart.

The rough steps to implement this feature are as follows:
- Create a new branch for this feature.
- Add a plus (+) button next to each product to add it to the cart
- The backend should be able to track the number of available items
- The backend should be able to track the number of items in the cart
- On the frontend there should be a plus (+) button to add an item to the cart
- On the frontend there should be a cart list in the bottom left corner that shows the items in the cart

After implementing the above steps, thoroughly test the shopping cart functionality to ensure a seamless user experience. If you encounter any issues or need further clarification, feel free to ask questions about the codebase or request additional files. Once you have completed the implementation and testing, please provide a summary of the changes made and any relevant details about the implementation.

After that, create a pull request with the changes made in the new branch. Ensure that the pull request description includes a summary of the changes and any relevant details about the implementation.