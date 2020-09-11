import ConfigData from "../models/ConfigData";

export default class MyLog {
    public static log(message?: any, ...optionalParams: any[])
    {
        if(ConfigData.isLog)
        {
            if(optionalParams != null && optionalParams.length > 0)
            {
                console.log(message, optionalParams);
            }
            else
            {
                console.log(message);
            }
        }
    }

    public static error(message?: any, ...optionalParams: any[])
    {
        if(ConfigData.isLog)
        {
            if(optionalParams != null && optionalParams.length > 0)
            {
                console.error(message, optionalParams);
            }
            else
            {
                console.error(message);
            }
        }
    }
}