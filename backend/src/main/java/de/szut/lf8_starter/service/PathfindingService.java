package de.szut.lf8_starter.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PathfindingService {

    private Map<String, List<String>> roomGraph = Map.of(
            "001", List.of("002"),
            "002", List.of("001", "002B"),
            "002B", List.of("002", "003", "007","008","009","010"),
            "003", List.of("002B", "004","007","008", "009","010"),
            "004", List.of("003", "009","010","008","007"),
            "005|006", List.of("007"),
            "007", List.of("005", "006", "002B","008","003","004"),
            "008", List.of("007", "009", "010", "002B", "003", "004"),
            "009", List.of("008", "004","003","002B"),
            "010", List.of("008", "004","003","002B")
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
                return path; // Found the path
            }

            if (!visited.contains(last)) {
                visited.add(last);
                for (String neighbor : graph.getOrDefault(last, new ArrayList<>())) {
                    List<String> newPath = new ArrayList<>(path);
                    newPath.add("roomaxis"+neighbor);
                    queue.add(newPath);
                }
            }
        }
        return List.of(); // No path found
    }



}
