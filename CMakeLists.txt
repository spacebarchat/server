cmake_minimum_required(VERSION 3.2)
project(fosscord-media)

set(CMAKE_CXX_STANDARD 17)

find_package(Threads REQUIRED)

find_package(mongocxx REQUIRED)
find_package(Boost REQUIRED)


file(GLOB SourceFiles ${PROJECT_SOURCE_DIR}/src/*.cpp)
#include_directories("bsoncxx/v_noabi/bsoncxx/")
add_executable(${CMAKE_PROJECT_NAME} ${SourceFiles})

target_link_libraries(${CMAKE_PROJECT_NAME} datachannel mongo::mongocxx_shared Boost::boost)