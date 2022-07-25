"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const isSurvey = (jsonContent) => {
    if (Object.keys(jsonContent).length === 0 || !jsonContent.hasOwnProperty("header"))
        return false;
    if (jsonContent?.header?.type?.split("-").pop().toLowerCase() !== "survey")
        return false;
    return true;
};
const checkArgs = () => {
    if (process.argv.length > 1) {
        const path = process.argv[2];
        if (fs_1.default.existsSync(path)) {
            const contents = fs_1.default.readFileSync(path).toString();
            let jsonContent;
            try {
                jsonContent = JSON.parse(contents);
                const surveyHeader = jsonContent.header;
                if (!isSurvey(jsonContent)) {
                    return console.log("error not a survey", surveyHeader?.type || jsonContent.status);
                }
                if (!surveyHeader)
                    console.log("jsonContent", jsonContent);
                setSurveyDetails(surveyHeader);
                traverseChildren(jsonContent, surveyHeader.id);
                console.log(tally[surveyHeader.id].questions.join(' '));
            }
            catch (error) {
                console.log("error in try catch", error);
                return;
            }
        }
        else {
            console.log("error file path does not exist");
        }
    }
    else {
        console.log("error no argv passed");
    }
};
let tally = {};
const traverseChildren = (object, surveyId) => {
    if (object.hasOwnProperty("children")) {
        object.children.forEach((child) => traverseChildren(child, surveyId));
    }
    if (object?.header?.type.includes("question")) {
        tally[surveyId].totalQuestions++;
        tally[surveyId].questions.push(object?.header?.deviceId);
    }
};
const setSurveyDetails = (jsonContentHeader) => {
    tally[jsonContentHeader.id] = {
        ...jsonContentHeader,
        totalQuestions: 0,
        questions: []
    };
};
checkArgs();
// find ./ -type d -maxdepth 1 -exec bash -c 'COUNT=$(ls {} | wc -l); echo "${COUNT} is the count"; [[ $COUNT -gt 0 ]] && echo \"helol\";' \;
