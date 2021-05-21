cmake_minimum_required(VERSION 3.15)
project(fosscord-media)

set(CMAKE_CXX_STANDARD 17)

find_package(Threads REQUIRED)
find_package(Protobuf REQUIRED)
find_package(gRPC CONFIG REQUIRED)
find_package(absl REQUIRED)
find_package(nlohmann_json REQUIRED)

file(GLOB SourceFiles ${PROJECT_SOURCE_DIR}/src/*.cpp)

file(GLOB ProtoFiles ${PROJECT_SOURCE_DIR}/src/protodefs/*.proto)
set(PROTOBUF_INPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/src/protodefs)
set(PROTOBUF_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/src/protodefs/include)

foreach(file ${ProtoFiles})
    execute_process(COMMAND "LD_LIBRARY_PATH=/usr/local/lib protoc --proto_path=\"${PROTOBUF_INPUT_DIRECTORY}\" 
	--cpp_out=\"${PROJECT_SOURCE_DIR}/src/protodefs/include\" --grpc_out=\"${PROJECT_SOURCE_DIR}/src/protodefs/include\" 
	--plugin=protoc-gen-grpc=/usr/local/bin/grpc_cpp_plugin protos.proto"
            WORKING_DIRECTORY ${PROJECT_SOURCE_DIR})
endforeach()


include_directories(${Protobuf_INCLUDE_DIRS})

#protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ProtoFiles) 

add_executable(${CMAKE_PROJECT_NAME} ${SourceFiles})

target_link_libraries(${CMAKE_PROJECT_NAME} datachannel gRPC::grpc++ absl::base absl::synchronization absl::strings ${Protobuf_LIBRARIES} nlohmann_json::nlohmann_json)