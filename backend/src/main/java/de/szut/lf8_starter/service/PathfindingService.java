package de.szut.lf8_starter.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PathfindingService {

//    private final Map<String, List<String>> roomGraph = Map.ofEntries(
//            "001", List.of("002"),
//            "002", List.of("001", "002B"),
//            "002B", List.of("002", "003", "007","008","009|010"),
//            "003", List.of("002B", "004","007","008", "009|010"),
//            "004", List.of("003", "009|010","010","008","007","mainentrysecond"),
//            "005|006", List.of("007"),
//            "007", List.of("005|006", "002B","008","003","004"),
//            "008", List.of("007", "009|010", "002B", "003", "004"),
//            "009|010", List.of("008", "004","003","002B","mainentryfirst"),
//
//            "042|044", List.of("045"),
//            "045", List.of("042|044", "secondentry","038","041"),
//            "046|049", List.of("secondentry","041","038"),
//            "041", List.of("046|049", "secondentry","045","038"),
//            "038", List.of("secondentry","045","060","041"),
//            "060", List.of("035","038"),
//            "035", List.of("060"),
//
//            "mainentrysecond", List.of("004","mainentryfirst","glasscorridor"),
//            "mainentryfirst", List.of("009|010", "mainentrysecond"),
//
//            "glasscorridor", List.of("corridorstairs", "mainentrysecond"),
//            "corridorstairs", List.of("secondentry","glasscorridor"),
//            "secondentry", List.of("corridorstairs","041","046|049","045","038")


    private final Map<String, List<String>> roomGraph = Map.ofEntries(
            Map.entry("001", List.of("002")),
            Map.entry("002", List.of("001", "002B")),
            Map.entry("002B", List.of("002", "003", "007", "008", "009|010")),
            Map.entry("003", List.of("002B", "004", "007", "008", "009|010")),
            Map.entry("004", List.of("003", "009|010", "010", "008", "007", "mainentrysecond")),
            Map.entry("005|006", List.of("007")),
            Map.entry("007", List.of("005|006", "002B", "008", "003", "004")),
            Map.entry("008", List.of("007", "009|010", "002B", "003", "004")),
            Map.entry("009|010", List.of("008", "004", "003", "002B", "mainentryfirst")),
            Map.entry("042|044", List.of("045")),
            Map.entry("045", List.of("042|044", "secondentry", "038", "041")),
            Map.entry("046|049", List.of("secondentry", "041", "038")),
            Map.entry("041", List.of("046|049", "secondentry", "045", "038")),
            Map.entry("038", List.of("secondentry", "045", "060", "041")),
            Map.entry("060", List.of("035", "038")),
            Map.entry("035", List.of("060")),
            Map.entry("mainentrysecond", List.of("004", "mainentryfirst", "glasscorridor")),
            Map.entry("mainentryfirst", List.of("009|010", "mainentrysecond")),
            Map.entry("glasscorridor", List.of("corridorstairs", "mainentrysecond")),
            Map.entry("corridorstairs", List.of("secondentry", "glasscorridor")),
            Map.entry("secondentry", List.of("corridorstairs", "041", "046|049", "045", "038"))
    );


    public String calculatePath(String start, String target){
        return String.join(",",findShortestPath(roomGraph, start, target));
    }



    private List<String> findShortestPath(Map<String, List<String>> graph, String start, String target) {
        Queue<List<String>> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        queue.add(List.of(start));

        while (!queue.isEmpty()) {
            List<String> path = queue.poll();
            String last = path.get(path.size() - 1);

            if (last.equals(target)) {
                return path.stream().map(e -> "roomaxis"+e).collect(Collectors.toList()); // Found the path
            }

            if (!visited.contains(last)) {
                visited.add(last);
                for (String neighbor : graph.getOrDefault(last, new ArrayList<>())) {
                    List<String> newPath = new ArrayList<>(path);
                    newPath.add(neighbor);
                    queue.add(newPath);
                }
            }
        }
        return List.of(); // No path found
    }



}
