# Family Genogram Builder

A comprehensive web-based tool for creating and managing family genograms, specifically designed for family medicine practitioners. This application provides an intuitive interface for visualizing family relationships and medical histories across generations.

![Genogram Builder Screenshot](https://via.placeholder.com/800x500.png?text=Genogram+Builder+Screenshot)

## ✨ Features

### Family Member Management

- Add detailed family member profiles including:
  - Name and gender
  - Birth and death dates
  - Medical conditions and health history
  - Deceased status with visual indicators

### Relationship Mapping

- Create various relationship types:
  - Parent-Child relationships
  - Marriages and Divorces
  - Sibling relationships
- Automatic layout with professional diagramming
- Drag-and-drop interface for easy arrangement

### Data Management

- Import/Export genogram data in JSON format
- Responsive design works on desktop, tablet, and mobile

### Visualization

- Color-coded nodes based on gender
- Different node shapes for different relationship types
- Clear visual indicators for deceased family members
- Zoom and pan functionality for large family trees

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher) or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/genogram-builder.git
   cd genogram-builder
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

Start the development server:

```bash
npm start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 🛠️ Usage

### Adding Family Members

1. Click "Add Member" in the sidebar
2. Fill in the member's details (name, gender, birth date, etc.)
3. Toggle "Deceased" and add death date if applicable
4. Add any relevant medical conditions
5. Click "Add Member" to save

### Creating Relationships

1. Select "Add Relationship" in the sidebar
2. Choose the source family member from the first dropdown
3. Choose the target family member from the second dropdown
4. Select the relationship type (parent-child, married, divorced, siblings)
5. Click "Add Relationship" to create the connection

### Importing/Exporting Data

- **Export**: Click the download icon to save your genogram as a JSON file
- **Import**: Use the upload button to load a previously saved genogram

## 📱 Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder, bundling React in production mode and optimizing the build for the best performance.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Project Link: [https://github.com/mfranco1/genogram-builder](https://github.com/mfranco1/genogram-builder)
