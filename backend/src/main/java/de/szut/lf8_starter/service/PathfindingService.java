package de.szut.lf8_starter.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PathfindingService {

    private Map<String, List<String>> roomGraph = Map.of(
            "roomaxis001", List.of("roomaxis002"),
            "roomaxis002", List.of("roomaxis001", "roomaxis002B"),
            "roomaxis002B", List.of("roomaxis002", "roomaxis003", "roomaxis007","roomaxis008","roomaxis009","roomaxis010"),
            "003", List.of("roomaxis002B", "roomaxis004","roomaxis007","roomaxis008", "roomaxis009","roomaxis010"),
            "004", List.of("roomaxis003", "roomaxis009","roomaxis010","roomaxis008","roomaxis007"),
            "roomaxis005|006", List.of("roomaxis007"),
            "roomaxis007", List.of("roomaxis005", "roomaxis006", "roomaxis002B","roomaxis008","roomaxis003","roomaxis004"),
            "roomaxis008", List.of("roomaxis007", "roomaxis009", "roomaxis010", "roomaxis002B", "roomaxis003", "roomaxis004"),
            "roomaxis009", List.of("roomaxis008", "roomaxis004","roomaxis003","roomaxis002B"),
            "roomaxis010", List.of("roomaxis008", "roomaxis004","roomaxis003","roomaxis002B")
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
                    newPath.add(neighbor);
                    queue.add(newPath);
                }
            }
        }
        return List.of(); // No path found
    }



}
