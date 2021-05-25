#include "mongoStub.hpp"

mongoStub::mongoStub() {
    if (this->client) {
        this->db = client["fosscord"];

        if (this->db) {
            this->col = db["events"];

        } else {
            std::cout << "db not found";
            exit(-1);
        }
    } else {
        std::cout << "Client couldn't be initialized";
        exit(-1);
    }
}

// Too slow for my liking
std::vector<mongoStub::mongoMessage> mongoStub::getNewMessages(
    mongocxx::change_stream* colCs) {
    std::vector<mongoStub::mongoMessage> retVec;

    for (auto&& event : *colCs) {
        mongoStub::mongoMessage returnValue;

        std::cout << bsoncxx::to_json(event) << std::endl;

        // Only listen to insert events (to avoid "precondition failed: data"
        // exception)
        if (event["operationType"].get_utf8().value.to_string() != "insert") {
            continue;
        }

        std::string evName = event["fullDocument"]["event"].get_utf8().value.to_string();

		if(evName.substr(0, 7)=="VSERVER"){ continue; } //Ignore the event if it's been emited by a voice server

        if (evName == "UDP_CONNECTION") {
            handleUdpRequest(
				event["fullDocument"]["data"]["d"]["address"].get_utf8().value.to_string(),
				event["fullDocument"]["data"]["d"]["port"].get_int32().value,
				event["fullDocument"]["data"]["d"]["mode"].get_utf8().value.to_string()
				);

        } else if (evName == "VOICE_REQUEST") {
			//TODO
            continue;
        }

        returnValue.eventName = evName;
        retVec.push_back(returnValue);
    }

    return retVec;
}


void mongoStub::handleUdpRequest(std::string address, int port, std::string mode) {
    using bsoncxx::builder::basic::kvp;
    using bsoncxx::builder::basic::sub_array;
    using bsoncxx::builder::basic::sub_document;

    auto builder = bsoncxx::builder::basic::document{};

	//Handle UDP socket stuff (later tho)
	
    builder.append(kvp("event", "VSERVER_UDP_RESPONSE"));
    builder.append(kvp("op", "4"));
    builder.append(kvp("d", [](sub_document subdoc) {
		subdoc.append(kvp("mode", "CRYPT_MODE")),
		subdoc.append(kvp("secret_key", [](sub_array subarr) {
            subarr.append(1, 2, 3, 5);  // HOW DO I GEN A SKEY?
        }));
	}));
	
	
	bsoncxx::stdx::optional<mongocxx::result::insert_one> r= col.insert_one(builder.view());
}

void mongoStub::handleVoiceRequest() {
	//Is this really needed? idk
}