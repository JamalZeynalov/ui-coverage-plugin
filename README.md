<img src="icons/icon128.png" alt="extension-icon" style="padding-top: 30px">

# "UI Tests Coverage" Google Chrome Extension

This extension is created to visualize the coverage of the UI tests on the web page.

## Framework

Current version is intended to work with the Allure TestOps platform only.<br>
The logic of how the content of the `.json` file content can be generated is implemented in the
[ui-coverage-example](https://github.com/JamalZeynalov/ui-coverage-example) project.<br>
You can generate your own data with any applicable framework.
The only requirement - the ".json" file you upload <u>must be in the same format</u> as the example data.

## How to use

### Install and configure the extension

1. Clone the extension repository from GitHub:<br>
    ```shell
    git clone git@github.com:JamalZeynalov/ui-coverage-plugin.git
    ```
2. Open the Chrome browser and navigate to [chrome://extensions/](chrome://extensions/)
3. Enable the developer mode
4. Click on the "Load unpacked" button and select the cloned repository folder
5. Open the "UI Tests Coverage" extension options ("Details" > "Extension options")
6. Set the URL of your Allure TestOps instance
7. Pin the extension to the browser toolbar

### Check your tests coverage

1. Open your web-page where you want to measure the coverage
2. Click on the extension icon
3. Upload the ".json" file with the test data (e.g. `used_locators.json`)
   - Click on the "No File Selected" button
   - Upload `.json` file
4. Click on the "Check" button
    - The extension will highlight the elements on the web page according to the test coverage
    - "All elements highlighted!" message will be displayed once the process is finished
5. Check your page for the highlighted elements
   - Blocks of elements will be highlighted with light green color (`#5FC4015D`)
   - Single elements will be highlighted with dark green color (`#5FC401`)
6. Refresh the page to remove the highlights (optional)

### Demo
1. Navigate to the [demo page](https://ultimateqa.com/fake-landing-page)
2. Click on the extension icon
3. Upload the [used_locators_example.json](examples%2Fused_locators_example.json) file
4. Click on the "Check" button
5. Enjoy!

### Additional features
1. "Reset Selected File" button
    - Resets the selected file and removes the data from the extension memory
    - You can upload another file and check the coverage again
2. "Show All" button opens a sidebar showing:
   - Count of test cases interacted with elements on this page 
   - Original (not modified by the extension) page URL used while testing
   - List of test cases interacted with elements on this page
   - Test case IDs as links to open them in the Allure TestOps in a new tab (login will be asked)
   - "X" button to close the sidebar
3. "Covered Pages" button opens a sidebar showing:
   - All pages covered by the uploaded `.json` file
   - Covered pages URLs as links to open them in a new tab
   - "X" button to close the sidebar
4. A click on any highlighted element (not block) opens a sidebar showing:
   - Count of test cases interacted with this element on this page
   - Element's full xpath locator
   - List of test cases interacted with this element
   - Test cases count and Original URL used while testing
5. Hovering over any highlighted element (single) shows a tooltip with its Xpath locator