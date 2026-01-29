#include "media-direction.h"

rtc::Description::Direction strToDirection(const std::string dirAsStr)
{
    rtc::Description::Direction dir = rtc::Description::Direction::Unknown;

    if (dirAsStr == "SendOnly")
        dir = rtc::Description::Direction::SendOnly;
    if (dirAsStr == "SendRecv")
        dir = rtc::Description::Direction::SendRecv;
    if (dirAsStr == "RecvOnly")
        dir = rtc::Description::Direction::RecvOnly;
    if (dirAsStr == "Inactive")
        dir = rtc::Description::Direction::Inactive;

    return dir;
}

std::string directionToStr(rtc::Description::Direction dir)
{
    std::string dirAsStr;
    switch (dir)
    {
    case rtc::Description::Direction::Unknown:
        dirAsStr = "Unknown";
        break;
    case rtc::Description::Direction::SendOnly:
        dirAsStr = "SendOnly";
        break;
    case rtc::Description::Direction::RecvOnly:
        dirAsStr = "RecvOnly";
        break;
    case rtc::Description::Direction::SendRecv:
        dirAsStr = "SendRecv";
        break;
    case rtc::Description::Direction::Inactive:
        dirAsStr = "Inactive";
        break;
    default:
        dirAsStr = "UNKNOWN_DIR_TYPE";
    }
    return dirAsStr;
}
