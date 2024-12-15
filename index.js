const fs = require('fs');
const pdf = require('pdf-parse');

// Read PDF file
let dataBuffer = fs.readFileSync('fmbs.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data);

    // Extract text from PDF
    let text = data.text;

    // Split text into lines
    let lines = text.split('\n');

    // Initialize variables
    let currentQuestion = '';
    let options = {};
    let isQuestion = false;
    let questionArray = [];

    // Process each line
    lines.forEach(line => {
        line = line.trim();

        // Check if line starts with a number followed by a dot (e.g., "23.")
        if (/^\d+\.\s/.test(line)) {
            // If there's a current question, push it to the result array
            if (currentQuestion && Object.keys(options).length > 0) {
                questionArray.push({
                    question: currentQuestion.trim(),
                    options: options
                });
            }

            // Start a new question
            currentQuestion = line.replace(/^\d+\.\s/, '').trim();
            options = {}; // Reset options
            isQuestion = true; // Mark as in question
        }
        // Check if the line starts with a letter followed by a dot (e.g., "A.")
        else if (/^[A-E]\./.test(line)) {
            let optionKey = line[0]; // Extract option key (e.g., "A")

            // Extract option text and handle multi-line options
            let optionText = line.substring(2).trim();
            if (options[optionKey]) {
                options[optionKey] += ' ' + optionText;
            } else {
                options[optionKey] = optionText;
            }

            isQuestion = false; // Not in question text anymore
        } else {
            // If still in question, append line to the current question
            if (isQuestion) {
                currentQuestion += ' ' + line;
            } else {
                // Otherwise, append to the last option text
                let lastOptionKey = Object.keys(options).pop();
                if (lastOptionKey) {
                    options[lastOptionKey] += ' ' + line;
                }
            }
        }
    });

    // Push the last question to the array
    if (currentQuestion && Object.keys(options).length > 0) {
        questionArray.push({
            question: currentQuestion.trim(),
            options: options
        });
    }

    // Write the JSON array to a file
    fs.writeFileSync('fmbs.txt', JSON.stringify(questionArray, null, 2));

    console.log('Questions formatted and saved to questionsFormatted.txt');
}).catch(function (error) {
    console.error('Error parsing PDF:', error);
});

