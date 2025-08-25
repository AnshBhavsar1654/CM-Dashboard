
"use client";

import type { EventData } from "@/lib/types";
import { useMemo } from "react";
import { 
    TotalDistanceCard, 
    DistrictsCoveredCard, 
    TotalEventsCard, 
    StatCard, 
    CulturalReligiousEventsCard,
    eventTypeCardsConfig 
} from "@/components/dashboard/stats-cards";
import { DistrictsNotCoveredCard } from "@/components/dashboard/districts-not-covered-card";

interface StatsGridProps {
    data: EventData[];
}

export function StatsGrid({ data }: StatsGridProps) {
    const stats = useMemo(() => {
        // Hardcoded list of 33 Gujarat districts
        const gujaratDistricts = [
            "Ahmedabad", "Gandhinagar", "Mahesana", "Banaskantha", "Sabarkantha", 
            "Aravalli", "Patan", "Rajkot", "Surat", "Vadodara", "Anand", "Amreli", 
            "Kheda", "Kutch", "Bhavnagar", "Dahod", "Panchmahal", "Porbandar", 
            "Gir Somnath", "Mahisagar", "Narmada", "Bharuch", "Jamnagar", "Navsari", 
            "Valsad", "Junagadh", "Surendranagar", "Tapi", "Dang", "Devbhoomi Dwarka", 
            "Morbi", "Botad", "Chhota Udepur"
        ];
        
        // Get districts from filtered events (excluding "Out of State")
        const coveredDistricts = new Set(
            data
                .filter(event => event.district && event.district !== "Out of State")
                .map(event => event.district)
        );
        
        // Calculate not covered districts by comparing against hardcoded list
        const notCoveredDistricts = gujaratDistricts.filter(district => !coveredDistricts.has(district));
        
        const governmentTypes = ["government event"];
        const publicTypes = ["public event"];
        const socialTypes = ["social event"];
        const culturalReligiousTypes = ["cultural & religious event"];
        const politicalTypes = ["political event"];
        const otherTypes = ["other event", "private event", "personal event"]; // Include private and personal events

        const categorizedData = data.reduce((acc, event) => {
            const eventTypeLower = event.type.toLowerCase();
            if (governmentTypes.includes(eventTypeLower)) {
                acc.governmentEvents++;
            } else if (publicTypes.includes(eventTypeLower)) {
                acc.publicEvents++;
            } else if (socialTypes.includes(eventTypeLower)) {
                acc.socialEvents++;
            } else if (culturalReligiousTypes.includes(eventTypeLower)) {
                acc.culturalReligiousEvents++;
            } else if (politicalTypes.includes(eventTypeLower)) {
                acc.politicalEvents++;
            } else if (otherTypes.includes(eventTypeLower)) { // Check for other events including private and personal
                acc.otherEvents++;
            }
            return acc;
        }, {
            governmentEvents: 0,
            publicEvents: 0,
            socialEvents: 0,
            culturalReligiousEvents: 0,
            politicalEvents: 0,
            otherEvents: 0,
        });
        
        return {
            totalEvents: data.length,
            totalDistance: data.reduce((acc, event) => acc + event.distanceTravelled, 0),
            districtsCovered: coveredDistricts.size,
            notCoveredDistricts: notCoveredDistricts,
            ...categorizedData
        };
    }, [data]);

    // Combine all event cards including Cultural & Religious
    const allEventCards = [
        { 
            component: <CulturalReligiousEventsCard value={stats.culturalReligiousEvents} events={data} />,
            key: "culturalReligious"
        },
        ...eventTypeCardsConfig.map(item => ({
            component: <StatCard 
                title={item.title} 
                value={stats[item.key]} 
                Icon={item.Icon} 
                events={data}
                eventTypeFilter={item.title === "Govt. Events" ? "government event" :
                              item.title === "Public Events" ? "public event" :
                              item.title === "Social Events" ? "social event" :
                              item.title === "Political Events" ? "political event" :
                              item.title === "Other Events" ? ["other event", "private event", "personal event"] : ""}
            />,
            key: item.key
        }))
    ];

    return (
        <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-1 md:gap-4 w-full h-full min-h-[320px]">
            {/* Top 3 main cards in a responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 justify-center">
                <TotalEventsCard value={stats.totalEvents} events={data} />
                <TotalDistanceCard value={stats.totalDistance} events={data} />
                <DistrictsCoveredCard value={stats.districtsCovered} />
            </div>
            
            {/* Event type cards and Districts Not Covered card in a flex layout */}
            <div className="flex flex-col md:flex-row gap-2 flex-grow">
                {/* Event type cards in a 2x3 grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-grow">
                    {allEventCards.map((card, _index) => (
                        <div key={card.key} className="w-full">
                            {card.component}
                        </div>
                    ))}
                </div>
                
                {/* Districts not covered card - same width as Districts Covered card */}
                <div className="flex-shrink-0 w-full max-w-[350px] flex">
                    <DistrictsNotCoveredCard notCoveredDistricts={stats.notCoveredDistricts} />
                </div>
            </div>
        </div>
    );
}
