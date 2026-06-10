<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\ActivityPoint;
use App\Models\EventParticipant;
use Carbon\Carbon;

class ActivityController extends Controller
{
    // ðŸ”¥ GET ACTIVITIES
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 401);
            }

            // ðŸ”¥ TAMBAHKAN with('points') agar data koordinat ikut terkirim ke Frontend
            $activities = Activity::where('user_id', $user->id)
                ->where('status', 'finished')

                ->with([
                    'points',
                    'user'
                ])

                ->orderBy('start_time', 'desc')
                ->get();

            return response()->json([
                'data' => $activities
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    // ðŸ”¥ START
    public function start(Request $request)
    {
        $request->validate([
            'start_lat' => 'required|numeric',
            'start_lng' => 'required|numeric',
            'event_id' => 'nullable|exists:events,id'
        ]);

        $event = null;

        if ($request->event_id) {

            $event = \App\Models\Event::find($request->event_id);

            /*
            |--------------------------------------------------------------------------
            | SINGLE SESSION PROTECTION
            |--------------------------------------------------------------------------
            */

            if ($event->tracking_mode === 'single_session') {

                $alreadyFinished =
                    \App\Models\EventParticipant::where(
                        'event_id',
                        $event->id
                    )
                        ->where(
                            'user_id',
                            auth()->id()
                        )
                        ->where(
                            'is_finished',
                            true
                        )
                        ->exists();

                if ($alreadyFinished) {

                    return response()->json([
                        'message' =>
                            'Anda sudah menyelesaikan race ini'
                    ], 403);
                }
            }
        }
        $activity = Activity::create([
            'user_id' => auth()->id(),
            'event_id' => $request->event_id,
            'start_time' => now(),
            'start_lat' => $request->start_lat,
            'start_lng' => $request->start_lng,
            'status' => 'recording'
        ]);

        if ($request->event_id) {

            \App\Models\EventParticipant::where('event_id', $request->event_id)
                ->where('user_id', auth()->id())
                ->update([
                    'race_status' => 'running',
                    'started_at' => now()
                ]);

        }

        $activity->load([
            'points',
            'user'
        ]);

        return response()->json($activity);
    }

    // ðŸ”¥ FINISH
    public function finish($id)
    {
        $activity = Activity::where('act_id', $id)->firstOrFail();

        $distanceKm = $activity->distance ?? 0;
        $endTime = now();
        $duration = $activity->start_time->diffInSeconds($endTime);

        $pace = $distanceKm > 0 ? (int) ($duration / $distanceKm) : 0;
        $lastPoint = ActivityPoint::where('act_id', $id)
            ->latest('id')
            ->first();

        $activity->end_time = $endTime;
        $activity->duration = $duration;
        $activity->distance = $distanceKm;
        $activity->pace = $pace;

        $activity->status = 'finished';

        $activity->end_lat = $lastPoint
            ? $lastPoint->latitude
            : $activity->start_lat;

        $activity->end_lng = $lastPoint
            ? $lastPoint->longitude
            : $activity->start_lng;

        $activity->save();

        // 🔥 REFRESH OBJECT DARI DATABASE
        $activity->refresh();

        if ($activity->event_id) {

            $event = \App\Models\Event::find($activity->event_id);

            // update participant
            \App\Models\EventParticipant::where('event_id', $activity->event_id)
                ->where('user_id', $activity->user_id)
                ->update([
                    'finished_at' => now(),
                    'jarak_ditempuh' => $distanceKm,
                    'waktu_tempuh_detik' => $duration,
                ]);

            /*
            |--------------------------------------------------------------------------
            | SINGLE SESSION
            |--------------------------------------------------------------------------
            */

            if ($event->tracking_mode === 'single_session') {

                \App\Models\EventParticipant::where('event_id', $activity->event_id)
                    ->where('user_id', $activity->user_id)
                    ->update([
                        'race_status' => 'finished',
                        'is_finished' => true
                    ]);

                \App\Models\EventResult::updateOrCreate(
                    [
                        'event_id' => $activity->event_id,
                        'user_id' => $activity->user_id,
                    ],
                    [
                        'activity_id' => $activity->act_id,

                        'distance' => $distanceKm,
                        'duration' => $duration,
                        'avg_pace' => gmdate("i:s", $pace),

                        'started_at' => $activity->start_time,
                        'finished_at' => now(),

                        'status' => 'finished'
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | ACCUMULATIVE
            |--------------------------------------------------------------------------
            */ else {

                $totalDistance = \App\Models\Activity::where('event_id', $event->id)
                    ->where('user_id', $activity->user_id)
                    ->where('status', 'finished')
                    ->sum('distance');

                $totalDuration = \App\Models\Activity::where('event_id', $event->id)
                    ->where('user_id', $activity->user_id)
                    ->where('status', 'finished')
                    ->sum('duration');

                $avgPace = $totalDistance > 0
                    ? gmdate("i:s", $totalDuration / $totalDistance)
                    : '00:00';

                $isCompleted = $totalDistance >= $event->target_jarak;

                \App\Models\EventParticipant::where('event_id', $activity->event_id)
                    ->where('user_id', $activity->user_id)
                    ->update([
                        'race_status' => $isCompleted
                            ? 'finished'
                            : 'idle',
                        'is_finished' => $isCompleted,
                        'jarak_ditempuh' => $totalDistance,
                        'waktu_tempuh_detik' => $totalDuration,
                    ]);

                $existingResult = \App\Models\EventResult::where(
                    'event_id',
                    $activity->event_id
                )
                    ->where(
                        'user_id',
                        $activity->user_id
                    )
                    ->first();

                \App\Models\EventResult::updateOrCreate(

                    [
                        'event_id' => $activity->event_id,
                        'user_id' => $activity->user_id,
                    ],

                    [
                        'activity_id' => $activity->act_id,

                        'distance' => $totalDistance,

                        'duration' => $totalDuration,

                        'avg_pace' => $avgPace,

                        'started_at' => $existingResult
                            ? $existingResult->started_at
                            : $activity->start_time,

                        'finished_at' => now(),

                        'status' => $isCompleted
                            ? 'finished'
                            : 'running'
                    ]
                );

            }
        }

        if ($activity->event_id) {

            $this->recalculateEventRanks(
                $activity->event_id
            );
        }

        $activity->load([
            'user',
            'points'
        ]);

        return response()->json($activity);
    }

    // ðŸ”¥ SAVE
    public function save(Request $request, $id)
    {
        try {
            $activity = Activity::where('act_id', $id)->firstOrFail();

            $activity->update([
                'title' => $request->title,
                'description' => $request->description,
                'sport_type' => $request->sport_type,
                'status' => 'finished'
            ]);

            $activity->load('user');

            return response()->json([
                'message' => 'Activity saved',
                'data' => $activity
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // STORE POINTS
    public function storePoints(Request $request, $id)
    {
        try {

            $request->validate([
                'points' => 'required|array|min:1',
                'points.*.latitude' => 'required|numeric',
                'points.*.longitude' => 'required|numeric',
            ]);

            $activity = Activity::where('act_id', $id)
                ->firstOrFail();

            /*
            |--------------------------------------------------------------------------
            | LAST POINT
            |--------------------------------------------------------------------------
            */

            $lastPoint = ActivityPoint::where('act_id', $id)
                ->latest('id')
                ->first();

            $totalNewDistance = 0;

            /*
            |--------------------------------------------------------------------------
            | INSERT NEW POINTS
            |--------------------------------------------------------------------------
            */

            foreach ($request->points as $point) {

                ActivityPoint::create([
                    'act_id' => $id,
                    'latitude' => $point['latitude'],
                    'longitude' => $point['longitude'],
                    'recorded_at' => isset($point['recorded_at'])
                        ? Carbon::parse(
                            $point['recorded_at']
                        )->format('Y-m-d H:i:s')
                        : now(),
                ]);

                /*
                |--------------------------------------------------------------------------
                | INCREMENTAL DISTANCE
                |--------------------------------------------------------------------------
                */

                if ($lastPoint) {

                    $distanceMeter = $this->calculatePointDistance(
                        $lastPoint->latitude,
                        $lastPoint->longitude,
                        $point['latitude'],
                        $point['longitude']
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | FILTER GPS JUMPS
                    |--------------------------------------------------------------------------
                    */

                    if ($distanceMeter < 100) {

                        $totalNewDistance += $distanceMeter;
                    }
                }

                $lastPoint = (object) $point;
            }

            /*
            |--------------------------------------------------------------------------
            | UPDATE ACTIVITY REALTIME
            |--------------------------------------------------------------------------
            */

            $distanceKm =
                ($activity->distance ?? 0)
                + ($totalNewDistance / 1000);

            $duration =
                $activity->start_time
                    ->diffInSeconds(now());

            $pace = $distanceKm > 0
                ? (int) ($duration / $distanceKm)
                : 0;

            $activity->update([
                'distance' => $distanceKm,
                'duration' => $duration,
                'pace' => $pace,
            ]);

            /*
            |--------------------------------------------------------------------------
            | REALTIME EVENT ENGINE
            |--------------------------------------------------------------------------
            */

            if ($activity->event_id) {

                /*
                |--------------------------------------------------------------------------
                | UPDATE PARTICIPANT
                |--------------------------------------------------------------------------
                */

                /*
    |--------------------------------------------------------------------------
    | REALTIME ACCUMULATIVE CALCULATION
    |--------------------------------------------------------------------------
    */

                $totalDistanceRealtime =
                    \App\Models\Activity::where(
                        'event_id',
                        $activity->event_id
                    )
                        ->where(
                            'user_id',
                            $activity->user_id
                        )
                        ->where(
                            'act_id',
                            '!=',
                            $activity->act_id
                        )
                        ->sum('distance')
                    + $distanceKm;

                $totalDurationRealtime =
                    \App\Models\Activity::where(
                        'event_id',
                        $activity->event_id
                    )
                        ->where(
                            'user_id',
                            $activity->user_id
                        )
                        ->where(
                            'act_id',
                            '!=',
                            $activity->act_id
                        )
                        ->sum('duration')
                    + $duration;

                /*
                |--------------------------------------------------------------------------
                | UPDATE PARTICIPANT REALTIME
                |--------------------------------------------------------------------------
                */

                \App\Models\EventParticipant::where(
                    'event_id',
                    $activity->event_id
                )
                    ->where(
                        'user_id',
                        $activity->user_id
                    )
                    ->update([

                        'jarak_ditempuh' =>
                            round($totalDistanceRealtime, 2),

                        'waktu_tempuh_detik' =>
                            $totalDurationRealtime,

                        'race_status' => 'running'
                    ]);

                /*
                |--------------------------------------------------------------------------
                | UPDATE EVENT RESULT REALTIME
                |--------------------------------------------------------------------------
                */

                $avgRealtimePace =
                    $totalDistanceRealtime > 0
                    ? gmdate(
                        'i:s',
                        $totalDurationRealtime / $totalDistanceRealtime
                    )
                    : '00:00';

                $existingResult =
                    \App\Models\EventResult::where(
                        'event_id',
                        $activity->event_id
                    )
                        ->where(
                            'user_id',
                            $activity->user_id
                        )
                        ->first();

                \App\Models\EventResult::updateOrCreate(

                    [
                        'event_id' => $activity->event_id,

                        'user_id' => $activity->user_id,
                    ],

                    [

                        'activity_id' => $activity->act_id,

                        'distance' =>
                            round($totalDistanceRealtime, 2),

                        'duration' =>
                            $totalDurationRealtime,

                        'avg_pace' =>
                            $avgRealtimePace,

                        'started_at' =>
                            $existingResult
                            ? $existingResult->started_at
                            : $activity->start_time,

                        'status' => $activity->status === 'paused'
                            ? 'paused'
                            : 'running'
                    ]
                );
                $participant =
                    \App\Models\EventParticipant::where(
                        'event_id',
                        $activity->event_id
                    )
                        ->where(
                            'user_id',
                            $activity->user_id
                        )
                        ->first();

                $currentStatus =
                    $participant->race_status ?? 'running';

                $existingResult =
                    \App\Models\EventResult::where(
                        'event_id',
                        $activity->event_id
                    )
                        ->where(
                            'user_id',
                            $activity->user_id
                        )
                        ->first();

                \App\Models\EventResult::updateOrCreate(

                    [
                        'event_id' => $activity->event_id,

                        'user_id' => $activity->user_id,
                    ],

                    [

                        'activity_id' => $activity->act_id,

                        'distance' =>
                            round($totalDistanceRealtime, 2),

                        'duration' =>
                            $totalDurationRealtime,

                        'avg_pace' =>
                            $avgRealtimePace,

                        'started_at' =>
                            $existingResult
                            ? $existingResult->started_at
                            : $activity->start_time,

                        'status' => $currentStatus
                    ]
                );



                /*
                |--------------------------------------------------------------------------
                | RECALCULATE RANK
                |--------------------------------------------------------------------------
                */
                if (now()->second % 10 === 0) {

                    $this->recalculateEventRanks(
                        $activity->event_id
                    );
                }
            }

            return response()->json([
                'message' => 'Points saved realtime',
                'distance' => round($distanceKm, 2),
                'duration' => $duration,
            ]);

        } catch (\Throwable $e) {

            return response()->json([

                'error' => $e->getMessage(),

                'line' => $e->getLine()

            ], 500);
        }
    }

    // ðŸ”¥ DISTANCE CALCULATOR
    private function calculateDistance($points)
    {
        $total = 0;
        for ($i = 1; $i < count($points); $i++) {
            $lat1 = deg2rad($points[$i - 1]->latitude);
            $lon1 = deg2rad($points[$i - 1]->longitude);
            $lat2 = deg2rad($points[$i]->latitude);
            $lon2 = deg2rad($points[$i]->longitude);

            $dlat = $lat2 - $lat1;
            $dlon = $lon2 - $lon1;

            $a = sin($dlat / 2) * sin($dlat / 2) +
                cos($lat1) * cos($lat2) *
                sin($dlon / 2) * sin($dlon / 2);

            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $earth = 6371000;
            $total += $earth * $c;
        }
        return $total;
    }

    private function calculatePointDistance(
        $lat1,
        $lon1,
        $lat2,
        $lon2
    ) {

        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);

        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a =
            sin($dlat / 2) * sin($dlat / 2) +

            cos($lat1) *
            cos($lat2) *

            sin($dlon / 2) *
            sin($dlon / 2);

        $c = 2 * atan2(
            sqrt($a),
            sqrt(1 - $a)
        );

        return 6371000 * $c;
    }

    private function recalculateEventRanks($eventId)
    {
        $event = \App\Models\Event::find($eventId);

        if (!$event)
            return;

        $query = \App\Models\EventResult::where(
            'event_id',
            $eventId
        );

        /*
        |--------------------------------------------------------------------------
        | SORTING
        |--------------------------------------------------------------------------
        */

        /*
|--------------------------------------------------------------------------
| LONGEST DISTANCE
|--------------------------------------------------------------------------
*/

        if (
            $event->competition_type
            === 'longest_distance'
        ) {

            $query
                ->orderByDesc('distance')
                ->orderBy('duration');
        }

        /*
        |--------------------------------------------------------------------------
        | FASTEST FINISH
        |--------------------------------------------------------------------------
        */ else {

            $query
                ->where('status', 'finished')
                ->orderBy('duration')
                ->orderByDesc('distance');
        }

        $results = $query->get();

        foreach ($results as $index => $result) {

            $result->update([
                'rank_position' => $index + 1
            ]);
        }
    }

    public function getPoints($id)
    {
        $points = ActivityPoint::where('act_id', $id)
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $points
        ]);
    }

    public function pause($id)
    {
        $activity = Activity::where('act_id', $id)
            ->firstOrFail();
        $activity->update([
            'status' => 'paused'
        ]);

        EventParticipant::where(
            'event_id',
            $activity->event_id
        )
            ->where(
                'user_id',
                $activity->user_id
            )
            ->update([
                'race_status' => 'paused'
            ]);

        return response()->json([
            'message' => 'Tracking paused'
        ]);
    }

    public function resume($id)
    {
        $activity = Activity::where('act_id', $id)
            ->firstOrFail();

        $activity->update([
            'status' => 'recording'
        ]);

        EventParticipant::where(
            'event_id',
            $activity->event_id
        )
            ->where(
                'user_id',
                $activity->user_id
            )
            ->update([
                'race_status' => 'running'
            ]);

        return response()->json([
            'message' => 'Tracking resumed'
        ]);
    }


}