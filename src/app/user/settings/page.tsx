"use client"

import * as React from "react"
import { Save, User, Bell, Shield, Key } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile")

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-semibold text-[24px] md:text-[32px] tracking-[-0.02em] text-[#121c2a]">Settings</h2>
          <p className="font-normal text-[14px] text-[#424753] mt-1">Manage your account preferences, security, and notifications.</p>
        </div>
        <button className="bg-[#0058be] hover:bg-[#2170e4] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all",
              activeTab === "profile" ? "bg-[#f8f9ff] text-[#0058be]" : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
            )}
          >
            <User size={18} />
            Profile Settings
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all",
              activeTab === "notifications" ? "bg-[#f8f9ff] text-[#0058be]" : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
            )}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all",
              activeTab === "security" ? "bg-[#f8f9ff] text-[#0058be]" : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
            )}
          >
            <Shield size={18} />
            Security
          </button>
          <button 
            onClick={() => setActiveTab("api")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all",
              activeTab === "api" ? "bg-[#f8f9ff] text-[#0058be]" : "text-[#424754] hover:bg-[#f8f9ff] hover:text-[#0058be]"
            )}
          >
            <Key size={18} />
            API Keys
          </button>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === "profile" && (
            <>
              {/* Profile Section */}
              <div className="bg-white border border-[#c2c6d6]/40 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-bold text-[#121c2a] mb-6">Profile Information</h3>
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1 space-y-2">
                      <label className="text-[14px] font-semibold text-[#121c2a]">First Name</label>
                      <input 
                        type="text" 
                        defaultValue="Jane"
                        className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[14px] font-semibold text-[#121c2a]">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue="Doe"
                        className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#121c2a]">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue="jane.doe@university.edu"
                      disabled
                      className="w-full px-4 py-2.5 bg-[#eff4ff] text-[#727785] border border-[#c2c6d6]/50 rounded-xl text-[14px] cursor-not-allowed"
                    />
                    <p className="text-[12px] text-[#727785] mt-1">Institutional emails cannot be changed directly. Contact IT support for assistance.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#121c2a]">Research Role</label>
                    <select className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c2c6d6] rounded-xl text-[14px] focus:outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all">
                      <option>PhD Student</option>
                      <option>Professor</option>
                      <option>Research Assistant</option>
                      <option>Undergraduate</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white border border-[#c2c6d6]/40 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-bold text-[#121c2a] mb-6">Workspace Preferences</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-[#c2c6d6]/30">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#121c2a]">Default AI Model</h4>
                      <p className="text-[12px] text-[#727785] mt-1">Select the default model used for synthesis.</p>
                    </div>
                    <select className="px-3 py-2 bg-[#f8f9ff] border border-[#c2c6d6] rounded-lg text-[13px] font-medium outline-none">
                      <option>Lumis Core (Fast)</option>
                      <option>GPT-4o (Accurate)</option>
                      <option>Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#c2c6d6]/30">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#121c2a]">Dark Mode</h4>
                      <p className="text-[12px] text-[#727785] mt-1">Toggle dark mode for the entire workspace.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#121c2a]">Compact View</h4>
                      <p className="text-[12px] text-[#727785] mt-1">Display more items per page in library.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white border border-[#c2c6d6]/40 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-bold text-[#121c2a] mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[15px] font-bold text-[#121c2a] mb-4">Email Notifications</h4>
                  <div className="space-y-4 border border-[#c2c6d6]/40 rounded-xl p-5 bg-[#f8f9ff]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[14px] font-semibold text-[#121c2a]">Document Analysis Complete</h5>
                        <p className="text-[12px] text-[#727785] mt-0.5">Receive an email when long document synthesis finishes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>
                    <div className="h-px bg-[#c2c6d6]/30"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[14px] font-semibold text-[#121c2a]">Weekly Digest</h5>
                        <p className="text-[12px] text-[#727785] mt-0.5">Summary of your reading progress and workspace usage.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>
                    <div className="h-px bg-[#c2c6d6]/30"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[14px] font-semibold text-[#121c2a]">System Updates</h5>
                        <p className="text-[12px] text-[#727785] mt-0.5">Important updates regarding AI models and platform features.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[15px] font-bold text-[#121c2a] mb-4">In-App Notifications</h4>
                  <div className="space-y-4 border border-[#c2c6d6]/40 rounded-xl p-5 bg-[#f8f9ff]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[14px] font-semibold text-[#121c2a]">Shared Documents</h5>
                        <p className="text-[12px] text-[#727785] mt-0.5">When colleagues share research documents with you.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>
                    <div className="h-px bg-[#c2c6d6]/30"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[14px] font-semibold text-[#121c2a]">Subscription Alerts</h5>
                        <p className="text-[12px] text-[#727785] mt-0.5">When you are approaching your AI query or storage limit.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#c2c6d6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0058be]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "security" || activeTab === "api") && (
            <div className="bg-white border border-[#c2c6d6]/40 rounded-2xl p-6 md:p-8 shadow-sm flex items-center justify-center min-h-[300px] animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-[#eff4ff] text-[#0058be] rounded-full flex items-center justify-center mx-auto">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#121c2a]">Coming Soon</h3>
                <p className="text-[14px] text-[#727785] max-w-sm">This settings module is currently under development.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
