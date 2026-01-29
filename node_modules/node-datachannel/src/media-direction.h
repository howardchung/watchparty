#ifndef MEDIA_DIRECTION_H
#define MEDIA_DIRECTION_H

#include <napi.h>
#include <rtc/rtc.hpp>

rtc::Description::Direction strToDirection(const std::string dirAsStr);
std::string directionToStr(rtc::Description::Direction dir);  

#endif // MEDIA_DIRECTION_H
