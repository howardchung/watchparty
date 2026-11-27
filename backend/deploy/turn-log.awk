# Coturn log messages may contain transport addresses and authentication usernames.
# Emit only counters understood by the resource sampler and fixed operator signals.
match($0, /Global turn allocation count (incremented|decremented), now [0-9]+/) {
    print substr($0, RSTART, RLENGTH)
    fflush()
    next
}
{
    line = tolower($0)
    if (line ~ /allocation quota|quota reached|insufficient capacity|cannot create relay endpoint|no available (relay )?ports|allocation.*(exhaust|failed|failure)/)
        print "TURN allocation quota or capacity failure", ++failures
    else if (line ~ /error|fatal/)
        print "TURN relay error"
    else if (line ~ /warning/)
        print "TURN relay warning"
    else
        next
    fflush()
}
