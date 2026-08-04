"use client";

import { useState } from "react";
import { 
  UserPlus, Layout, Globe, Users, Edit3, ListChecks, Trophy, 
  CalendarDays, PlusCircle, HelpCircle, FileText, Map 
} from "lucide-react";

import { TabGroup, Tab } from "@/components/Tabs";
import Button from "@/components/Button";
import AddRunner from "./AddRunner";
import EditRunner from "./EditRunner";
import ManageAwards from "./ManageAwards";
import ManageSchedule from "./ManageSchedule";
import AddResults from "./AddResults";
import FAQManager from "./ManageFAQs";
import ManageHomeNotes from "./ManageHomeNotes";
import ManageMaps from "./ManageMaps";

type TabType = 'pages' | 'runners' | 'website';
type RosterViewType = 'add' | 'edit' | 'manage' | 'awards'; 
type WebsiteViewType = 'schedule' | 'settings' | 'results';
type PageViewType = 'faqs' | 'home' | 'maps';

interface DashboardProps {
  userName: string;
}

export default function CoachDashboardClient({ userName }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('runners');
  const [rosterView, setRosterView] = useState<RosterViewType>('add');
  const [websiteView, setWebsiteView] = useState<WebsiteViewType>('schedule');
  const [pageView, setPageView] = useState<PageViewType>('faqs');
  const [selectedMeetKey, setSelectedMeetKey] = useState<number | undefined>(undefined);

  return (
    <main className="max-w-4xl mx-auto py-8">
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
          Coach Dashboard
        </h1>
        <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Welcome back, {userName || "Coach"}.
        </p>
      </header>

      <div className="mb-10 w-full md:w-auto inline-block">
        <TabGroup>
          <Tab label="Pages" isActive={activeTab === 'pages'} onClick={() => setActiveTab('pages')} />
          <Tab label="Results" isActive={activeTab === 'website'} onClick={() => setActiveTab('website')} />
          <Tab label="Runners" isActive={activeTab === 'runners'} onClick={() => setActiveTab('runners')} />
        </TabGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Context Info & Sub-Navigation */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-background border border-border p-6 rounded-2xl shadow-sm sticky top-6">
            <div className="flex items-center space-x-3 text-foreground mb-4">
              {activeTab === 'runners' && <Users size={20} />}
              {activeTab === 'pages' && <Layout size={20} />}
              {activeTab === 'website' && <Globe size={20} />}
              <h2 className="font-bold uppercase tracking-wider text-sm">
                {activeTab === 'runners' ? 'Roster Management' : activeTab === 'pages' ? 'Content' : 'Website Settings'}
              </h2>
            </div>
            
            <p className="text-sm text-light-gray leading-relaxed mb-6">
              {activeTab === 'runners' && "Manage your athlete database, update profiles, and build seasonal rosters."}
              {activeTab === 'pages' && "Edit home page content, FAQs, race recaps, and course maps."}
              {activeTab === 'website' && "Update your season schedule, global links, and site dates."}
            </p>

            {/* Pages Sub-Navigation */}
            {activeTab === 'pages' && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Button 
                  size="sm" 
                  isActive={pageView === 'home'} 
                  onClick={() => setPageView('home')}
                  className="w-full justify-start! gap-3"
                >
                  <FileText size={18} /> Home Page Content
                </Button>

                <Button 
                  size="sm" 
                  isActive={pageView === 'faqs'} 
                  onClick={() => setPageView('faqs')}
                  className="w-full justify-start! gap-3"
                >
                  <HelpCircle size={18} /> Manage FAQs
                </Button>

                {/* <-- Added Maps Button --> */}
                <Button 
                  size="sm" 
                  isActive={pageView === 'maps'} 
                  onClick={() => setPageView('maps')}
                  className="w-full justify-start! gap-3"
                >
                  <Map size={18} /> Manage Maps
                </Button>
              </div>
            )}

            {/* Runners Sub-Navigation */}
            {activeTab === 'runners' && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Button 
                  size="sm" 
                  isActive={rosterView === 'add'} 
                  onClick={() => setRosterView('add')}
                  className="w-full justify-start! gap-3"
                >
                  <UserPlus size={18} /> Add New Runner
                </Button>
                
                <Button 
                  size="sm" 
                  isActive={rosterView === 'edit'} 
                  onClick={() => setRosterView('edit')}
                  className="w-full justify-start! gap-3"
                >
                  <Edit3 size={18} /> Edit Runner
                </Button>

                <Button 
                  size="sm" 
                  isActive={rosterView === 'awards'} 
                  onClick={() => setRosterView('awards')}
                  className="w-full justify-start! gap-3"
                >
                  <Trophy size={18} /> Manage Awards
                </Button>

                <Button 
                  size="sm" 
                  isActive={rosterView === 'manage'} 
                  onClick={() => setRosterView('manage')}
                  className="w-full justify-start! gap-3"
                >
                  <ListChecks size={18} /> Manage Rosters
                </Button>
              </div>
            )}

            {/* Results Sub-Navigation */}
            {activeTab === 'website' && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Button 
                  size="sm" 
                  isActive={websiteView === 'schedule'} 
                  onClick={() => setWebsiteView('schedule')}
                  className="w-full justify-start! gap-3"
                >
                  <CalendarDays size={18} /> Manage Schedule
                </Button>

                <Button 
                  size="sm" 
                  isActive={websiteView === 'results'} 
                  onClick={() => setWebsiteView('results')}
                  className="w-full justify-start! gap-3"
                >
                  <PlusCircle size={18} /> Add Race Results
                </Button>
                
                <Button 
                  size="sm" 
                  isActive={websiteView === 'settings'} 
                  onClick={() => setWebsiteView('settings')}
                  className="w-full justify-start! gap-3"
                >
                  <Globe size={18} /> Global Settings
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Dynamic Content Area */}
        <div className="md:col-span-8">
          
          {/* Pages Views */}
          {activeTab === 'pages' && pageView === 'home' && <ManageHomeNotes />}
          {activeTab === 'pages' && pageView === 'faqs' && <FAQManager />}
          {activeTab === 'pages' && pageView === 'maps' && <ManageMaps />} {/* <-- Added Maps Render --> */}

          {/* Runners Views */}
          {activeTab === 'runners' && rosterView === 'add' && <AddRunner />}
          {activeTab === 'runners' && rosterView === 'edit' && <EditRunner />}
          {activeTab === 'runners' && rosterView === 'awards' && <ManageAwards />}
          {activeTab === 'runners' && rosterView === 'manage' && (
            <section className="bg-background border border-border rounded-2xl p-12 text-center shadow-sm">
               <ListChecks size={48} className="mx-auto mb-4 text-light-gray opacity-50" />
               <h3 className="text-xl font-bold text-foreground mb-2">Manage Seasonal Rosters</h3>
               <p className="text-sm text-light-gray">Toggle athletes on and off the active roster.</p>
            </section>
          )}

          {/* Website Views */}
          {activeTab === 'website' && websiteView === 'schedule' && <ManageSchedule />}
          
          {activeTab === 'website' && websiteView === 'results' && (
            <AddResults initialMeetKey={selectedMeetKey} />
          )}
          
          {activeTab === 'website' && websiteView === 'settings' && (
            <div className="p-12 border-2 border-dashed border-border rounded-2xl text-center text-foreground">
              <Globe size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs text-light-gray">Site Settings Coming Soon</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}