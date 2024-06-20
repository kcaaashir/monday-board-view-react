# Duplicate Monitor Settings

This project is a web application to monitor and handle duplicate items in a Monday.com board.

## Getting Started

These instructions will help you set up the project on your local machine.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

1. Start the application:
    ```bash
    npm start
    ```

2. After starting the application, get the tunnel URL provided by your terminal if not tunnel using mapps. 

3. Go to your Monday.com account and navigate to hosting the `Build` section in the developer settings.

4. Create a new feature or update an existing feature with the tunnel URL to host the application.

### Usage

1. After setting up the tunnel URL in Monday.com, you can start using the Duplicate Monitor Settings app in your Monday.com account.

2. Select the columns you want to monitor for duplicates and set the action to perform when duplicates are found.

3. Save the settings and the app will automatically monitor for duplicates and perform the configured actions.

### Built With

- React
- Monday.com SDK
- monday-ui-react-core

### Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-new-feature`.
3. Commit your changes: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature/my-new-feature`.
5. Submit a pull request.

### Acknowledgments

- Thanks to the Monday.com team for their SDK and UI components.