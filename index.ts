import fs from 'fs'

const isSurvey = (jsonContent: Record<string, any>) => {
    if(Object.keys(jsonContent).length === 0 || !jsonContent.hasOwnProperty("header")) return false

    if(jsonContent?.header?.type?.split("-").pop().toLowerCase() !== "survey") return false

    return true
}

const checkArgs = () => {
    if(process.argv.length > 1) {
        const path = process.argv[2]

        if(fs.existsSync(path)) {
            const contents = fs.readFileSync(path).toString()
            let jsonContent: Record<string, unknown>;

            try {
                jsonContent = JSON.parse(contents) as Record<string, unknown>

                const surveyHeader = jsonContent.header as Header

                if(!isSurvey(jsonContent)) {
                    return console.log("error not a survey", surveyHeader?.type || jsonContent.status)
                }

                if(!surveyHeader) console.log("jsonContent",jsonContent)

                setSurveyDetails(surveyHeader)

                traverseChildren(jsonContent, surveyHeader.id)

                console.log(tally[surveyHeader.id].questions.join(' '))
            } catch (error) {
                console.log("error in try catch", error)
                return
            }

        } else {
            console.log("error file path does not exist");
        }
    } else {
        console.log("error no argv passed")
    }
}

interface Header {
    totalQuestions: number
    title: string
    deviceId: string
    id: string
    type: string
    platform: string
    exportName: string
    questions: string[]
  }

interface Tally {
    [key: string]: Header}

let tally: Tally = {}

const traverseChildren = (object: any, surveyId: string) => {
    if(object.hasOwnProperty("children")) {
        object.children.forEach((child: any) => traverseChildren(child, surveyId))
    }
    if(object?.header?.type.includes("question")) {
        tally[surveyId].totalQuestions++
        tally[surveyId].questions.push(object?.header?.deviceId)
    }
}

const setSurveyDetails = (jsonContentHeader: Header) => {
    tally[(jsonContentHeader.id as string)] = {
        ...jsonContentHeader,
        totalQuestions: 0,
        questions: []
    }
}

checkArgs()

// find ./ -type d -maxdepth 1 -exec bash -c 'COUNT=$(ls {} | wc -l); echo "${COUNT} is the count"; [[ $COUNT -gt 0 ]] && echo \"helol\";' \;

