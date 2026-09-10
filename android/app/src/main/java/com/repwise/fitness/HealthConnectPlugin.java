package com.repwise.fitness;

import androidx.health.connect.client.HealthConnectClient;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "HealthConnect")
public class HealthConnectPlugin extends Plugin {
    @PluginMethod
    public void getStatus(PluginCall call) {
        int sdkStatus = HealthConnectClient.getSdkStatus(getContext());
        boolean available = sdkStatus == HealthConnectClient.SDK_AVAILABLE;
        JSObject result = new JSObject();
        result.put("available", available);
        result.put("status", available ? "available" : "unavailable");
        call.resolve(result);
    }
}
