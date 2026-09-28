# Calorie Track

A simple daily calorie-tracking web app built with React. Add foods to meals, track your calories against a daily goal, and keep a separate log for each day.

## Features

- Add food entries with a name, calorie amount, and meal category
- Organise entries into Breakfast, Lunch, Dinner, and Snack
- View total calories eaten and calories remaining
- Set a custom daily calorie goal
- Visual calorie-progress ring
- Navigate between dates to view separate daily logs
- Edit or remove saved food entries
- Helpful validation for missing or invalid food entries
- Saves data in your browser using local storage

## Built With

- React
- Vite
- JavaScript
- CSS
- Browser Local Storage

## Run Locally

1. Clone this repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Open the `calorie-tracker` folder in VS Code.

3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in the terminal, usually:

   ```text
   http://localhost:5173/
   ```

## How to Use

1. Enter a food name and its calorie amount.
2. Select a meal category.
3. Click **Add** to save it to the current day.
4. Use **Edit** to update an entry or **Remove** to delete it.
5. Change the daily goal when needed.
6. Use the arrow buttons to view previous or future days.

## Data Storage

This app stores calorie logs and the daily goal in your browser's local storage. Your entries remain after refreshing the page, but they are stored only in the browser/device you use.

## Future Improvements

- Weekly calorie summary
- Mobile design refinements
- Clear a day's log with confirmation
- Optional nutrition information such as protein, carbs, and fat