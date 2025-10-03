/*
 * EXEMPLO: Portando MinotaurAI para Unity C#
 * Este é um exemplo conceitual de como adaptar o sistema para Unity
 */

using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public enum AIState
{
    IDLE,
    PATROL,
    CHASE,
    SEARCH,
    STUNNED
}

[System.Serializable]
public struct Vec2
{
    public float x, y;
    public Vec2(float x, float y) { this.x = x; this.y = y; }
    
    public static implicit operator Vector2(Vec2 v) => new Vector2(v.x, v.y);
    public static implicit operator Vec2(Vector2 v) => new Vec2(v.x, v.y);
}

public class MinotaurAI : MonoBehaviour
{
    [Header("AI Configuration")]
    public float speed = 2f;
    public float chaseSpeed = 3f;
    public float sightRange = 8f;
    public float fovDegrees = 120f;
    public float hearingRadius = 6f;
    public float memorySeconds = 3f;
    public float searchSeconds = 8f;
    public float repathInterval = 0.3f;
    
    [Header("Patrol Points")]
    public Transform[] patrolPoints;
    
    [Header("References")]
    public Transform player;
    public LayerMask wallMask = 1;
    
    // Internal state
    private AIState state = AIState.PATROL;
    private List<Vec2> path = new List<Vec2>();
    private float lastPathCalc = 0f;
    private Vec2? lastSeenPlayerAt;
    private Vec2? lastHeardAt;
    private float memoryTimer = 0f;
    private float searchTimer = 0f;
    private int patrolIndex = 0;
    private Vec2 facing = new Vec2(1, 0);
    
    // Unity components
    private NavMeshAgent navAgent;
    private Animator animator;
    
    void Start()
    {
        navAgent = GetComponent<NavMeshAgent>();
        animator = GetComponent<Animator>();
        
        // Configure NavMeshAgent
        navAgent.speed = speed;
        navAgent.stoppingDistance = 0.5f;
    }
    
    void Update()
    {
        float dt = Time.deltaTime;
        Vec2 selfPos = transform.position;
        Vec2 playerPos = player.position;
        
        // Update AI
        Vec2 newPos = UpdateAI(dt, selfPos, playerPos);
        
        // Apply movement using NavMeshAgent
        if (Vector3.Distance(transform.position, newPos) > 0.1f)
        {
            navAgent.SetDestination(newPos);
            navAgent.speed = GetCurrentSpeed();
        }
        
        // Update animations
        UpdateAnimations();
    }
    
    Vec2 UpdateAI(float dt, Vec2 self, Vec2 playerPos)
    {
        // 1) Perception
        bool sees = CanSee(self, playerPos);
        if (sees)
        {
            lastSeenPlayerAt = playerPos;
            memoryTimer = memorySeconds;
            if (state != AIState.CHASE) EnterState(AIState.CHASE);
        }
        else
        {
            memoryTimer = Mathf.Max(0, memoryTimer - dt);
        }
        
        // 2) State Machine
        switch (state)
        {
            case AIState.CHASE: return TickChase(dt, self, playerPos);
            case AIState.SEARCH: return TickSearch(dt, self);
            case AIState.PATROL: return TickPatrol(dt, self);
            case AIState.IDLE: return self;
            case AIState.STUNNED: return self;
        }
        
        return self;
    }
    
    bool CanSee(Vec2 self, Vec2 playerPos)
    {
        float distance = Vector2.Distance(self, playerPos);
        if (distance > sightRange) return false;
        
        // Line of sight check using Physics2D raycast
        Vector2 direction = (playerPos - self).normalized;
        RaycastHit2D hit = Physics2D.Raycast(self, direction, distance, wallMask);
        if (hit.collider != null) return false;
        
        // FOV check
        float angle = Vector2.Angle(facing, direction);
        return angle <= fovDegrees * 0.5f;
    }
    
    Vec2 TickChase(float dt, Vec2 self, Vec2 playerPos)
    {
        Vec2 target = lastSeenPlayerAt ?? playerPos;
        
        // Repath periodically
        lastPathCalc -= dt;
        if (lastPathCalc <= 0)
        {
            path = FindPathUnity(self, target);
            lastPathCalc = repathInterval;
        }
        
        // Transition to search if lost sight and memory expired
        if (!CanSee(self, playerPos) && memoryTimer <= 0)
        {
            if (lastSeenPlayerAt.HasValue)
                EnterState(AIState.SEARCH);
            else
                EnterState(AIState.PATROL);
        }
        
        return GetNextPosition(dt, self);
    }
    
    Vec2 TickSearch(float dt, Vec2 self)
    {
        searchTimer -= dt;
        Vec2 anchor = lastSeenPlayerAt ?? lastHeardAt ?? self;
        
        // Create search pattern around last known position
        if (path.Count == 0 || lastPathCalc <= 0)
        {
            Vec2 searchPoint = new Vec2(
                anchor.x + UnityEngine.Random.Range(-4f, 4f),
                anchor.y + UnityEngine.Random.Range(-4f, 4f)
            );
            path = FindPathUnity(self, searchPoint);
            lastPathCalc = repathInterval * 1.2f;
        }
        
        if (searchTimer <= 0)
            EnterState(AIState.PATROL);
        
        return GetNextPosition(dt, self);
    }
    
    Vec2 TickPatrol(float dt, Vec2 self)
    {
        if (patrolPoints.Length > 0)
        {
            // Patrol between fixed points
            Transform target = patrolPoints[patrolIndex % patrolPoints.Length];
            if (path.Count == 0)
                path = FindPathUnity(self, target.position);
            
            Vec2 next = GetNextPosition(dt, self);
            if (Vector2.Distance(next, target.position) < 1f)
            {
                patrolIndex++;
                path.Clear();
            }
            return next;
        }
        else
        {
            // Wander randomly
            if (path.Count == 0)
            {
                Vec2 wanderTarget = new Vec2(
                    self.x + UnityEngine.Random.Range(-6f, 6f),
                    self.y + UnityEngine.Random.Range(-6f, 6f)
                );
                path = FindPathUnity(self, wanderTarget);
            }
            return GetNextPosition(dt, self);
        }
    }
    
    List<Vec2> FindPathUnity(Vec2 from, Vec2 to)
    {
        // Use Unity's NavMeshAgent pathfinding
        NavMeshPath navPath = new NavMeshPath();
        if (NavMesh.CalculatePath(from, to, NavMesh.AllAreas, navPath))
        {
            List<Vec2> result = new List<Vec2>();
            foreach (Vector3 corner in navPath.corners)
            {
                result.Add(new Vec2(corner.x, corner.z)); // Note: Y->Z for 3D
            }
            if (result.Count > 0) result.RemoveAt(0); // Remove starting point
            return result;
        }
        
        return new List<Vec2>();
    }
    
    Vec2 GetNextPosition(float dt, Vec2 self)
    {
        if (path.Count == 0) return self;
        
        Vec2 target = path[0];
        float stepDist = GetCurrentSpeed() * dt;
        
        Vector2 direction = (target - self).normalized;
        Vec2 newPos = new Vec2(
            self.x + direction.x * stepDist,
            self.y + direction.y * stepDist
        );
        
        // Check if reached waypoint
        if (Vector2.Distance(newPos, target) < 0.3f)
        {
            path.RemoveAt(0);
            newPos = target;
        }
        
        // Update facing direction
        if (direction.magnitude > 0.1f)
            facing = direction;
        
        return newPos;
    }
    
    void EnterState(AIState newState)
    {
        state = newState;
        path.Clear();
        lastPathCalc = 0;
        
        if (newState == AIState.SEARCH)
            searchTimer = searchSeconds;
    }
    
    float GetCurrentSpeed()
    {
        return state == AIState.CHASE ? chaseSpeed : speed;
    }
    
    void UpdateAnimations()
    {
        if (animator == null) return;
        
        // Set animation parameters based on AI state
        animator.SetInteger("AIState", (int)state);
        animator.SetFloat("Speed", navAgent.velocity.magnitude);
        animator.SetFloat("FacingX", facing.x);
        animator.SetFloat("FacingY", facing.y);
    }
    
    // Public methods for external control
    public void OnPlayerNoise(Vector3 position, float intensity = 1f)
    {
        Vec2 noisePos = new Vec2(position.x, position.z);
        float distance = Vector2.Distance(transform.position, noisePos);
        
        if (distance <= hearingRadius * intensity)
        {
            lastHeardAt = noisePos;
            if (state != AIState.CHASE)
                EnterState(AIState.SEARCH);
        }
    }
    
    public void Stun(float duration = 3f)
    {
        EnterState(AIState.STUNNED);
        Invoke(nameof(WakeUp), duration);
    }
    
    public void WakeUp()
    {
        if (state == AIState.STUNNED)
            EnterState(AIState.PATROL);
    }
    
    // Getters for external systems
    public AIState GetState() => state;
    public Vec2 GetFacing() => facing;
    
    // Gizmos for debugging
    void OnDrawGizmosSelected()
    {
        // Draw sight range
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, sightRange);
        
        // Draw hearing range
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, hearingRadius);
        
        // Draw FOV
        if (Application.isPlaying)
        {
            Vector3 fovLeft = Quaternion.Euler(0, -fovDegrees * 0.5f, 0) * new Vector3(facing.x, 0, facing.y);
            Vector3 fovRight = Quaternion.Euler(0, fovDegrees * 0.5f, 0) * new Vector3(facing.x, 0, facing.y);
            
            Gizmos.color = Color.red;
            Gizmos.DrawRay(transform.position, fovLeft * sightRange);
            Gizmos.DrawRay(transform.position, fovRight * sightRange);
        }
        
        // Draw path
        if (path.Count > 0)
        {
            Gizmos.color = Color.green;
            Vector3 prev = transform.position;
            foreach (Vec2 point in path)
            {
                Vector3 worldPoint = new Vector3(point.x, transform.position.y, point.y);
                Gizmos.DrawLine(prev, worldPoint);
                Gizmos.DrawSphere(worldPoint, 0.2f);
                prev = worldPoint;
            }
        }
        
        // Draw last seen position
        if (lastSeenPlayerAt.HasValue)
        {
            Gizmos.color = Color.red;
            Vector3 pos = new Vector3(lastSeenPlayerAt.Value.x, transform.position.y, lastSeenPlayerAt.Value.y);
            Gizmos.DrawSphere(pos, 0.5f);
        }
    }
}

/*
 * COMO USAR NO UNITY:
 * 
 * 1. Criar um GameObject com NavMeshAgent e este script
 * 2. Configurar os parâmetros no Inspector
 * 3. Referenciar o player e configurar a layer mask de paredes
 * 4. Opcionalmente definir patrol points
 * 5. Configurar o Animator Controller com os parâmetros:
 *    - AIState (int): 0=IDLE, 1=PATROL, 2=CHASE, 3=SEARCH, 4=STUNNED
 *    - Speed (float): velocidade atual do agente
 *    - FacingX, FacingY (float): direção que está olhando
 * 
 * FUNCIONALIDADES UNITY-ESPECÍFICAS:
 * - Integração com NavMeshAgent para pathfinding automático
 * - Gizmos para debugging visual no Scene View
 * - Raycast 2D/3D para line of sight
 * - Sistema de Invoke para timers
 * - Animator Controller integration
 * - OnDrawGizmosSelected para visualização
 */