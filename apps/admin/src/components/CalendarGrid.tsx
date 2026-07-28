"use client";

import {
    add,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    startOfToday,
    startOfWeek,
    startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Delivery {
    id: string;
    date: string; // "DD/MM/YYYY" or ISO
    time: string;
    title: string;
    count: string;
    type: string;
}

interface CalendarGridProps {
    events: Delivery[];
}

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function CalendarGrid({ events = [] }: CalendarGridProps) {
    const today = startOfToday();
    const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
    const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

    const [selectedDay, setSelectedDay] = useState(today);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Normalize event dates for comparison logic
    // Assuming API returns "DD/MM/YYYY" from previous file analysis, but let's be robust
    const getEventDate = (dateStr: string) => {
        try {
            if (!dateStr) return new Date();
            // Try parsing if it's DD/MM/YYYY
            if (dateStr.includes("/")) {
                const parts = dateStr.split("/");
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    return new Date(parseInt(y || "0"), parseInt(m || "0") - 1, parseInt(d || "0"));
                }
            }
            return new Date(dateStr);
        } catch (e) {
            return new Date();
        }
    };

    const days = eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
    });

    const previousMonth = () => {
        const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };

    const nextMonth = () => {
        const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };

    const selectedDayEvents = events.filter((event) =>
        isSameDay(getEventDate(event.date), selectedDay)
    );

    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('expanded'); // Default to full/expanded as requested

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {format(firstDayCurrentMonth, "MMMM yyyy")}
                    </h2>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('compact')}
                            className={classNames(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'compact'
                                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            Comfortable
                        </button>
                        <button
                            onClick={() => setViewMode('expanded')}
                            className={classNames(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'expanded'
                                    ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            Full
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={previousMonth}
                        type="button"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        type="button"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x dark:divide-slate-800">
                {/* Calendar Grid Area */}
                <div className={classNames(
                    "flex-1 lg:col-span-8 p-4 flex flex-col",
                    viewMode === 'expanded' ? "h-auto min-h-0" : "flex-1 min-h-0 overflow-hidden"
                )}>
                    <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div className={classNames(
                        "grid grid-cols-7 gap-px lg:gap-2 bg-gray-200 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-800",
                        viewMode === 'expanded' ? "h-auto auto-rows-fr" : "flex-1 min-h-0 auto-rows-[1fr] overflow-hidden"
                    )}>
                        {days.map((day, dayIdx) => {
                            const dayEvents = events.filter((event) =>
                                isSameDay(getEventDate(event.date), day)
                            );
                            const hasEvents = dayEvents.length > 0;

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDay(day)}
                                    className={classNames(
                                        isSameMonth(day, firstDayCurrentMonth)
                                            ? "bg-white dark:bg-slate-900"
                                            : "bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-600",
                                        isEqual(day, selectedDay) && "ring-2 ring-inset ring-blue-500 z-10",
                                        "relative p-1 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group flex flex-col min-h-0",
                                        viewMode === 'compact' ? "overflow-hidden" : "h-auto min-h-[120px] overflow-visible"
                                    )}
                                >
                                    <time
                                        dateTime={format(day, "yyyy-MM-dd")}
                                        className={classNames(
                                            isToday(day)
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-900 dark:text-gray-200",
                                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold mx-auto lg:mx-0 shrink-0"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </time>

                                    {/* Desktop Event Dots */}
                                    <div className={classNames(
                                        "mt-1 space-y-0.5 hidden lg:block flex-1 min-h-0",
                                        viewMode === 'compact' ? "overflow-hidden" : ""
                                    )}>
                                        {dayEvents.slice(0, viewMode === 'compact' ? 4 : undefined).map((event) => (
                                            <div
                                                key={event.id}
                                                className="px-1 py-0.5 text-[9px] leading-tight rounded-[3px] truncate font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 shrink-0"
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {viewMode === 'compact' && dayEvents.length > 4 && (
                                            <div className="text-[9px] text-gray-400 dark:text-gray-500 pl-0.5 shrink-0">
                                                +{dayEvents.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Event Dots */}
                                    <div className="lg:hidden flex justify-center mt-1 space-x-1 shrink-0">
                                        {dayEvents.length > 0 && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side Panel: Selected Day Events */}
                <div className="lg:w-96 bg-gray-50 dark:bg-slate-950/50 p-6 flex flex-col h-1/3 lg:h-auto border-t lg:border-t-0 border-gray-200 dark:border-slate-800 shrink-0 overflow-hidden">
                    <div className="mb-4 shrink-0">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {format(selectedDay, "EEEE, MMMM d")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedDayEvents.length} scheduled deliver{selectedDayEvents.length !== 1 ? 'ies' : 'y'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700 pr-2">
                        <AnimatePresence mode="popLayout">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map((event) => (
                                    <Link key={event.id} href={`/orders/${event.id}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded-full">
                                                        {event.time}
                                                    </span>
                                                </div>
                                            </div>

                                            <h4 className="mt-2 font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {event.title}
                                            </h4>

                                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>Dispatch Scheduled</span>
                                            </div>

                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800 pt-2 flex justify-between">
                                                <span>Items: {event.count}</span>
                                                <span>#{event.id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                                    <Clock className="w-8 h-8 mb-2" />
                                    <p className="text-sm">No events scheduled</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
