BEGIN {
    port = "8080";
    http_service = "/inet/tcp/" port "/0/0";

    for (;;) {
        # a request has come, then get a reqeust body
        if ((http_service |& getline) > 0) {
            print "{ \"ok\": \"true\" }" |& http_service;
        }
        
        close(http_service);
    }
}