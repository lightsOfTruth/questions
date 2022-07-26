#!/bin/bash

    IFS=$'\n' read -r -d '' -a bare_dir_array < <(find ~+ -maxdepth 3 -type d -name _bare)

    # find all directories with name _bare and then loop through the list

    read -p "enter result directory: " result_dir
    result_dir=$(realpath -- $result_dir 2>/dev/null)

    if [ $? -eq 0 ] && [ -d $result_dir ]; then
        echo "result file will be saved to: $result_dir"
        RESULT_DIR=$result_dir
        else
            echo "directory does not exist. Please create a result directory and run again"
            return 1
    fi

    echo "result directory set to $(realpath -- $RESULT_DIR)"

    JS_SCRIPT=$(realpath -- ${RESULT_DIR}/index.js 2>/dev/null)

    [ $? -ne 0 ] || [ ! -f $JS_SCRIPT ] && echo "index.js file missing at ${RESULT_DIR}/index.js. Add your index.js file here" && return 1

    TEMP_BRANCH_QUESTION_ARRAY=()

    [ ! -f $JS_SCRIPT ] && echo "$JS_SCRIPT not available " && return 1

    CUR_DIRECTORY=$(realpath -- .)

    for ((dirIndex=0; dirIndex < ${#bare_dir_array[@]}; dirIndex++)); do
        DIR=$(realpath -- ${bare_dir_array[$dirIndex]})

        {
            cd $DIR

            BRANCHES=$(git for-each-ref --format='%(refname)' refs/heads/ 2>/dev/null)

            [ $? -ne 0 ] && echo "Not a git repository" && continue

            for branch in $(git for-each-ref --format='%(refname)' refs/heads/); do
                for document in $(git ls-tree -r --name-only $branch); do
                    NODE_OUTPUT=$(node $JS_SCRIPT <(git show $branch:$document) >&1)

                    echo $NODE_OUTPUT | grep "error" &>/dev/null

                    [ $? -eq 0 ] && echo ${NODE_OUTPUT[@]} && continue

                    TEMP_BRANCH_QUESTION_ARRAY+=($NODE_OUTPUT)

                    TEMP_BRANCH_QUESTION_ARRAY=($(IFS=$'\n'; echo "${TEMP_BRANCH_QUESTION_ARRAY[*]}" | sort -u))
                done
            done
        }

    done

    cd $CUR_DIRECTORY

    (
        cd $RESULT_DIR

        echo "current dir $(pwd)"

        IFS=$'\n'; echo "${TEMP_BRANCH_QUESTION_ARRAY[*]}" > questionIdsResult.txt
    )

    #   node -e 'console.log(process.argv[1])' "$(git show master:-yaZpTokd.json)"

    # node -e 'console.log(process.argv)' echo <(git show master:-yaZpTokd.json)

    #  awk '$0~/question/ {count++} {print $0} END{print count}' <(git show master:Hftcmo1mW.json)
