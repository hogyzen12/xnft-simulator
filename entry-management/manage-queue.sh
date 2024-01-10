#!/bin/bash

#We will also save the most recent transaction ID
previous_transaction="4mhh31UUaEyPcxdqHBNCHRfAAFvPXy3Gotp3VmQcC6S4Nh5EacCq7syJqGUQhkxpqMTed2qn14niXc6wVvn5XmxF"

#Loop to check if balance has changed
while true; do
	#Get the latest transaction we can see on chain
	latest_data=$(curl https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e \
	-X POST \
	-H "Content-Type: application/json" \
	-d $'[
		{
			"jsonrpc": "2.0",
			"id": 1,
			"method": "getSignaturesForAddress",
			"params": ["crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW",{"limit" : 1} ]
		}
	]')
	echo $latest_data
	latest_tx=$(echo $latest_data | jq '.[].result[].signature' )
	latest_tx=${latest_tx//\"/}
	echo "-------------------------"
	echo "Latest TX"
	echo $latest_tx
	echo "-------------------------"

	if [ "$latest_tx" = "$previous_transaction" ]; then
		echo "----------------------------"
 		echo "No new Tx detected, last TX:"
	  	echo $previous_transaction
		echo "----------------------------"
	else
      	#Print message to screen
      	echo "New TX detected, pulling queue and then TXs"	
		echo "getting TXs up till $previous_transaction"
		#Get new transactions
		transaction_data=$(curl https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e \
		-X POST \
		-H "Content-Type: application/json" \
		-d $'[
			{
				"jsonrpc": "2.0",
				"id": 1,
				"method": "getSignaturesForAddress",
				"params": ["crushpRpFZ7r36fNfCMKHFN4SDvc7eyXfHehVu34ecW",{"until" : "'$previous_transaction'","Commitment" : "Confirmed"} ]
			}
		]')

		#echo $transaction_data

		#Iterate over each transaction in the response
		n=$(echo $transaction_data | jq '.[].result | length')
		#knock one off here for indexing, as refering starts from 0
		n=$((n-1))
		
		while [[ $n -ge 0 ]];do
			signature=$(echo $transaction_data | jq .[].result[$n].signature)
			signature=$(echo $signature | tr -d '"')
			echo $signature

			#here let us pull the signature data quickly so we can parse the signer.
			tx_details=$(curl https://solana-mainnet.g.alchemy.com/v2/tJU39R0J_FS049vOxqzyl4qMGP3F-i1e \
			-X POST \
			-H "Content-Type: application/json" \
			--data $'[
				{
					"jsonrpc": "2.0",
					"id": 1,
					"method": "getTransaction",
					"params": ["'$signature'",{"encoding": "jsonParsed","maxSupportedTransactionVersion":0}]
				}
			]')
			#signer=$(echo $tx_details | jq .[].result[$n].signature)
			#echo $tx_details > details_$signature.json
			signer=$(echo $tx_details | jq '.[].result.transaction.message.accountKeys[] | select(.signer == true) | .pubkey')
			signer=$(echo $signer | tr -d '"')
			echo $signer

			#Parse memo field from transaction data
			memo_field=$(echo $transaction_data | jq .[].result[$n].memo)
			echo $memo_field
			
			cleaned_memo_field=$(echo $memo_field | cut -d "]" -f2)
			cleaned_memo_field=$(echo $cleaned_memo_field | tr -d '"')
			echo $cleaned_memo_field

			#python3 validate.py $cleaned_memo_field
			python3_output=$(python3 validate.py "$cleaned_memo_field")
			echo $python3_output
			points=$(echo "$python3_output" | cut -d ',' -f1 | cut -d ':' -f2)
			cards_collected=$(echo "$python3_output" | cut -d ',' -f2 | cut -d ':' -f2)
			echo $cards_collected
			echo $points
			# Log entry
			echo "Signature: $signature, Signer: $signer, Points: $points, Cards Collected: $cards_collected" >> transaction_log.txt


			# Read current leaderboard
			leaderboard_file="leaderboard.json"
			if [ ! -f "$leaderboard_file" ]; then
				echo '{"top_points": [], "top_cards_collected": []}' > "$leaderboard_file"
			fi

			# Function to update leaderboard
			update_leaderboard() {
				type=$1
				entry="{\"signer\":\"$signer\",\"points\":$points,\"cards_collected\":$cards_collected}"
				jq --argjson newEntry "$entry" --arg type "$type" '
					.[$type] |= (. + [$newEntry] | sort_by(.points) | reverse | .[0:3])
				' "$leaderboard_file" > tmp.json && mv tmp.json "$leaderboard_file"
			}

			# Update leaderboard for top points
			update_leaderboard "top_points"

			# Update leaderboard for top cards collected
			update_leaderboard "top_cards_collected"

			shdw-drive edit-file -r https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/ -kp /Users/hogyzen12/.config/solana/6tBou5MHL5aWpDy6cgf3wiwGGK2mR8qs68ujtpaoWrf2.json  -f leaderboard.json -u https://shdw-drive.genesysgo.net/3UgjUKQ1CAeaecg5CWk88q9jGHg8LJg9MAybp4pevtFz/leaderboard.json





			#move to upwards towards most recents
			n=$((n-1))
		done

		#Update most recent transaction ID
		previous_transaction=$latest_tx
		echo "Previous Transaction updated to latest one: $previous_transaction"
    fi

    sleep 15
	
done
