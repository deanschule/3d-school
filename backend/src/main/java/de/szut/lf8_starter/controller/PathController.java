package de.szut.lf8_starter.controller;

import de.szut.lf8_starter.service.PathfindingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController()
@RequestMapping("/path")
@RequiredArgsConstructor
public class PathController {
    private final PathfindingService pathfindingService;

    @GetMapping
    public String getPath(@RequestParam String startPoint, @RequestParam String targetPoint){
        return pathfindingService.calculatePath(startPoint,targetPoint);
    }
}
